import { createSlice } from '@reduxjs/toolkit'
import { createAppAsyncThunk as createAsyncThunk } from '../createAsyncThunk.js'
import type { RootState } from '../store.js'
// import { type WritableDraft } from 'immer/dist/types/types-external.js'
import { ProgrammingError } from 'firmcore/src/exceptions/ProgrammingError.js'
import firmcore, { type Address, type EFConstructorArgs, type EFMsg, type EFBlockPOD, type BlockId, type EFChainState, EFChain, MNormEFChainPOD, SyncOptions } from 'firmcore'
import { InvalidArgument } from 'firmcore/src/exceptions/InvalidArgument.js'
import { NotFound } from 'firmcore/src/exceptions/NotFound.js'
import { waitForInit } from '../initWaiter.js'

export interface ShallowChain {
  address: Address
  name: string
  symbol: string
}

export type FullChain = MNormEFChainPOD;

export type Chain = FullChain | ShallowChain;

export function isFullChain(c: Chain | undefined): c is FullChain {
  return c !== undefined && 'slots' in c;
}

export function isShallowChain(c: Chain | undefined): c is ShallowChain {
  return c !== undefined && !isFullChain(c);
}

export type ChainsStatus = 'ready' | 'loading' | 'error' | 'idle'

export interface Chains {
  byAddress: Record<Address, Chain>
  status: ChainsStatus
  focusChainAddr?: Address
  error?: string
}

const initialState: Chains = {
  byAddress: {},
  status: 'idle',
}

export interface EFCreateBlockArgs {
  chainAddr: Address
  msgs: EFMsg[]
};

export const init = createAsyncThunk(
  'chains/init',
  async (): Promise<Chains> => {
    const { fc } = await waitForInit();
    const chainAddrs = await fc.lsChains();
    const byAddress: Record<Address, Chain> = {};
    let focusChainAddr: Address | undefined;
    let firstCh: EFChain | undefined;
    for (const addr of chainAddrs) {
      const ch = await fc.getChain(addr);
      if (ch === undefined) {
        throw new Error('chain returned by lsChains, but not by getChain');
      }
      byAddress[addr] = {
        address: addr,
        name: ch.name,
        symbol: ch.symbol
      };
      if (firstCh === undefined) {
        firstCh = ch;
      }
    }
    if (firstCh !== undefined) {
      const pod = await firstCh.getNormPODChain();
      if (pod !== undefined) {
        byAddress[firstCh.address] = pod;
        focusChainAddr = firstCh.address;
      }
    }
    return { byAddress, focusChainAddr, status: 'ready' };
  }
)

export const setFocusChain = createAsyncThunk(
  'chains/setFocusChain',
  async (address: Address): Promise<Chain> => {
    const { fc } = await waitForInit();
    const ch = await fc.getChain(address);
    if (ch === undefined) {
      throw new Error('Chain not found')
    }
    const pod = await ch.getNormPODChain();
    return pod;
  }
)

export const createChain = createAsyncThunk(
  'chains/createChain',
  async (args: EFConstructorArgs): Promise<FullChain> => {
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

    const state = getState();
    const chain = selectChain(state, args.chainAddr)
    const headBl = selectHead(state, args.chainAddr)
    if ((chain === undefined) || (headBl == null)) {
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
    const { confirmer } = await waitForInit();

    if (confirmer === undefined) {
      throw new Error('Confirmer not loaded')
    }
    if (confirmer.address !== args.confirmerAddr) {
      throw new ProgrammingError('Different confirmer loaded than requested');
    }

    await confirmer.confirm(args.blockId)

    const chainAddress = args.chainAddress
    await dispatch(updateChain({ chainAddress }))
  }
)

export interface SyncChainArgs {
  chainAddr: Address
  toBlock: BlockId
  syncOptions?: SyncOptions
}

export const syncMounted = createAsyncThunk(
  'chains/syncMounted',
  async (args: SyncChainArgs, { dispatch }): Promise<void> => {
    const { fc } = await waitForInit();
    const chain = await fc.getChain(args.chainAddr);
    if (chain === undefined) {
      throw new InvalidArgument('Trying to sync unknown chain');
    }
    await chain.sync(args.toBlock, args.syncOptions);
    await dispatch(updateChain({ chainAddress: args.chainAddr }));
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
      .addCase(init.fulfilled, (state, action) => {
        state.byAddress = action.payload.byAddress;
        state.focusChainAddr = action.payload.focusChainAddr;
        state.status = action.payload.status;
      })

      .addCase(createChain.fulfilled, (state, action) => {
        const ch = action.payload;
        state.focusChainAddr = ch.address;
        state.byAddress[ch.address] = ch;
        state.status = 'ready';
      })

      .addCase(createBlock.fulfilled, (state, action) => {
        const { block, args } = action.payload
        const chain = state.byAddress[args.chainAddr]
        if (isFullChain(chain)) {
          chain.slots.proposed.push(block)
          state.status = 'ready';
        } else {
          throw new ProgrammingError('Chain should be stored')
        }
      })

      .addCase(updateChain.fulfilled, (state, action) => {
        const chain = action.payload
        state.byAddress[chain.address] = chain
        state.status = 'ready';
      })

      .addCase(setFocusChain.fulfilled, (state, action) => {
        const chPod = action.payload;
        state.byAddress[chPod.address] = chPod;
        state.focusChainAddr = chPod.address;
        state.status = 'ready';
      })
  }
})

// export const selectDefaultChainAddr = (state: RootState): Address | undefined => state.chains.byAddress[0];
export const selectChainsByAddress = (state: RootState): Record<Address, Chain> => state.chains.byAddress
// Use like this: const chain = useAppSelector(state => selectChain(state, "aaa"))
export const selectChain = (state: RootState, address: Address): Chain | undefined =>
  state.chains.byAddress[address]

// export const selectDefaultChain = (state: RootState): Chain | undefined => {
//   const defAddress = selectDefaultChainAddr(state)
//   if (defAddress !== undefined) {
//     return selectChain(state, defAddress)
//   } else {
//     return undefined
//   }
// }

export const selectHead = (state: RootState, chainAddr: Address): EFBlockPOD | undefined => {
  const chain = state.chains.byAddress[chainAddr]
  if (isFullChain(chain)) {
    return chain.slots.finalizedBlocks[chain.slots.finalizedBlocks.length - 1];
  } else {
    return undefined;
  }
}

export const selectFocusChain = (state: RootState): Chain | undefined => {
  if (state.chains.focusChainAddr !== undefined) {
    return state.chains.byAddress[state.chains.focusChainAddr];
  } else {
    return undefined;
  }
}

export const selectChainName = (state: RootState, address: Address): string | undefined =>
  (selectChain(state, address))?.name

export const selectChainState = (state: RootState, chainAddr: Address): EFChainState | undefined => {
  return (selectHead(state, chainAddr))?.state
}

export const selectStatus = (state: RootState): ChainsStatus =>
  state.chains.status;

export default chainsSlice.reducer;
