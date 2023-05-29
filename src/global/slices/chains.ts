import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { type RootState } from '../store.js'
import { type WritableDraft } from 'immer/dist/types/types-external.js'
import { ProgrammingError } from 'firmcore/src/exceptions/ProgrammingError.js'
import firmcore, { type Address, type EFConstructorArgs, type NormEFChainPOD, type EFMsg, type EFBlockPOD, type BlockId, type EFChainState } from 'firmcore'
import { getConfirmer } from '../wallets.js';
import { InvalidArgument } from 'firmcore/src/exceptions/InvalidArgument.js'
import { NotFound } from 'firmcore/src/exceptions/NotFound.js'
import { waitForInit } from '../init.js'

export type Chain = NormEFChainPOD

export interface Chains {
  byAddress: Record<Address, Chain>
  defaultChain?: Address
  // TODO: Unify the status with other slices?
  status: 'idle' | 'loading' | 'success' | 'failed'
  error?: string
}

const initialState: Chains = {
  byAddress: {},
  status: 'idle'
}

function _addChain (state: WritableDraft<Chains>, chain: Chain): void {
  // TODO: Proper validation of address
  if (chain.address.length !== 0 && (state.byAddress[chain.address] == null)) {
    state.byAddress[chain.address] = chain
    if (state.defaultChain === undefined) {
      state.defaultChain = chain.address
    }
  }
}

export interface EFCreateBlockArgs {
  chainAddr: Address
  msgs: EFMsg[]
};

export const createChain = createAsyncThunk(
  'chains/createChain',
  async (args: EFConstructorArgs): Promise<Chain> => {
    // TODO: timeout?
    await waitForInit();
    const efChain = await firmcore.createEFChain(args)
    return await efChain.getNormPODChain()
  }
)

export const createBlock = createAsyncThunk(
  'chains/createBlock',
  async (args: EFCreateBlockArgs, { getState }): Promise<{ args: EFCreateBlockArgs, block: EFBlockPOD }> => {
    await waitForInit();

    const state = getState() as RootState
    const chain = selectChain(state, args.chainAddr)
    const headBl = selectHead(state, args.chainAddr)
    if ((chain == null) || (headBl == null)) {
      throw new InvalidArgument('Cannot create a block for unknown chain')
    }

    const efChain = await firmcore.getChain(args.chainAddr)
    if (efChain == null) {
      throw new NotFound('Firmcore cannot find chain')
    }

    const bl = await efChain.builder.createBlock(headBl.id, args.msgs)

    const pod = await efChain.blockPODById(bl.id)
    if (pod == null) {
      throw new NotFound("Couldn't find block just created")
    }

    return { args, block: pod }
  }
)

export interface RefreshChainArgs {
  chainAddress: Address
}

export const updateChain = createAsyncThunk(
  'chains/updateChain',
  async (args: RefreshChainArgs) => {
    await waitForInit();

    const efChain = await firmcore.getChain(args.chainAddress)
    if (efChain == null) {
      throw new NotFound('Chain not found')
    }
    const podChain = await efChain.getNormPODChain()
    return podChain
  }
)

export interface ConfirmBlockArgs {
  confirmerAddr: Address
  blockId: BlockId
  chainAddress: Address
}

export const confirmBlock = createAsyncThunk(
  'chains/confirmBlock',
  async (args: ConfirmBlockArgs, { dispatch }): Promise<void> => {
    await waitForInit();

    const confirmer = getConfirmer();
    if (confirmer === undefined) {
      throw new Error('Confirmer not loaded')
    }
    if (confirmer.address !== args.confirmerAddr) {
      throw new ProgrammingError('Different confirmer loaded than requrested');
    }

    await confirmer.confirm(args.blockId)

    const chainAddress = args.chainAddress
    await dispatch(updateChain({ chainAddress }))
  }
)

export const chainsSlice = createSlice({
  name: 'chains',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
  },
  extraReducers: (builder) => {
    builder
      .addCase(createChain.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(createChain.fulfilled, (state, action) => {
        state.status = 'success'
        _addChain(state, action.payload)
      })
      .addCase(createChain.rejected, (state) => {
        state.status = 'failed'
      })

      .addCase(createBlock.fulfilled, (state, action) => {
        state.status = 'success'
        const { block, args } = action.payload
        const chain = state.byAddress[args.chainAddr]
        if (chain == null) {
          throw new ProgrammingError('Chain should be stored')
        }
        chain.slots.proposed.push(block)
      })

      .addCase(updateChain.fulfilled, (state, action) => {
        state.status = 'success'
        const chain = action.payload
        state.byAddress[chain.address] = chain
      })
  }
})

export const selectDefaultChainAddr = (state: RootState): Address | undefined => state.chains.defaultChain
export const selectChainsByAddress = (state: RootState): Record<Address, Chain> => state.chains.byAddress
// Use like this: const chain = useAppSelector(state => selectChain(state, "aaa"))
export const selectChain = (state: RootState, address: Address): Chain | undefined =>
  state.chains.byAddress[address]

export const selectDefaultChain = (state: RootState): Chain | undefined => {
  const defAddress = selectDefaultChainAddr(state)
  if (defAddress !== undefined) {
    return selectChain(state, defAddress)
  } else {
    return undefined
  }
}

export const selectHead = (state: RootState, chainAddr: Address): EFBlockPOD | undefined => {
  const chain = state.chains.byAddress[chainAddr]
  if (chain !== undefined) {
    return chain.slots.finalizedBlocks[chain.slots.finalizedBlocks.length - 1];
  } else {
    return undefined;
  }
}

export const selectChainName = (state: RootState, address: Address): string | undefined =>
  (selectChain(state, address))?.name

export const selectChainState = (state: RootState, chainAddr: Address): EFChainState | undefined => {
  return (selectHead(state, chainAddr))?.state
}

export default chainsSlice.reducer
