import { createAsyncThunk, createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk, RootState } from "../store";
import { WritableDraft } from 'immer/dist/types/types-external';
import assert from 'firmcore/src/helpers/assert';
import ProgrammingError from 'firmcore/src/exceptions/ProgrammingError';
import firmcore, { EFChainPODSlice, Address, EFConstructorArgs, NormEFChainPOD, EFMsg, EFBlockPOD, BlockId, walletManager } from 'firmcore';
import InvalidArgument from "firmcore/src/exceptions/InvalidArgument";
import NotFound from "firmcore/src/exceptions/NotFound";

export type Chain = NormEFChainPOD;

export interface Chains {
  byAddress: Record<Address, Chain>;
  defaultChain?: Address;
  // TODO: Unify the status with other slices?
  status: 'idle' | 'loading' | 'success' | 'failed';
  error?: string;
}

const initialState: Chains = {
  byAddress: {},
  status: 'idle',
}

function _addChain(state: WritableDraft<Chains>, chain: Chain) {
  // TODO: Proper validation of address
  if (chain.address.length && !state.byAddress[chain.address]) {
    state.byAddress[chain.address] = chain;
    if (!state.defaultChain) {
      state.defaultChain = chain.address;
    }
  }
}

export interface EFCreateBlockArgs {
  chainAddr: Address,
  msgs: EFMsg[],
};

export const createChain = createAsyncThunk(
  'chains/createChain',
  async (args: EFConstructorArgs): Promise<Chain> => {
    const efChain = await firmcore.createEFChain(args);
    return efChain.getNormPODChain();
  }
);

export const createBlock = createAsyncThunk(
  'chains/createBlock',
  async (args: EFCreateBlockArgs, { getState }): Promise<{ args: EFCreateBlockArgs, block: EFBlockPOD }> => {
    const state = getState() as RootState;
    const chain = selectChain(state, args.chainAddr);
    const headBl = selectHead(state, args.chainAddr);
    if (!chain || !headBl) {
      throw new InvalidArgument("Cannot create a block for unknown chain")
    }

    const efChain = await firmcore.getChain(args.chainAddr);
    if (!efChain) {
      throw new NotFound("Firmcore cannot find chain");
    }

    const bl = await efChain.builder.createBlock(headBl.id, args.msgs);
    
    const pod = await efChain.blockPODById(bl.id);
    if (!pod) {
      throw new NotFound("Couldn't find block just created");
    }

    return { args, block: pod };
  }
);

export type RefreshChainArgs = {
  chainAddress: Address
};

export const updateChain = createAsyncThunk(
  'chains/updateChain',
  async (args: RefreshChainArgs) => {
    const efChain = await firmcore.getChain(args.chainAddress);
    if (!efChain) {
      throw new NotFound("Chain not found");
    }
    const podChain = await efChain.getNormPODChain();
    return podChain;
  }
);

export interface ConfirmBlockArgs {
  confirmerAddr: Address,
  blockId: BlockId,
  chainAddress: Address,
}

export const confirmBlock = createAsyncThunk(
  'chains/confirmBlock',
  async (args: ConfirmBlockArgs, { dispatch }): Promise<void> => {
    const wallet = await walletManager.getWallet(args.confirmerAddr);
    if (!wallet) {
      throw new NotFound("Wallet not found");
    }
    const confirmer = await firmcore.createWalletConfirmer(wallet);

    await confirmer.confirm(args.blockId);
    
    const chainAddress = args.chainAddress;
    await dispatch(updateChain({ chainAddress }));
  }
);

export const chainsSlice = createSlice({
  name: 'chains',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
  },
  extraReducers: (builder) => {
    builder
      .addCase(createChain.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createChain.fulfilled, (state, action) => {
        state.status = 'success';
        _addChain(state, action.payload);
      })
      .addCase(createChain.rejected, (state) => {
        state.status = 'failed';
      })
      
      .addCase(createBlock.fulfilled, (state, action) => {
        state.status = 'success';
        const { block, args } = action.payload;
        const chain = state.byAddress[args.chainAddr];
        if (!chain) {
          throw new ProgrammingError("Chain should be stored");
        }
        chain.slots.proposed.push(block);
      })

      .addCase(updateChain.fulfilled, (state, action) => {
        state.status = 'success';
        const chain = action.payload;
        state.byAddress[chain.address] = chain;
      });
  },
});

export const selectDefaultChainAddr = (state: RootState) => state.chains.defaultChain;
export const selectChainsByAddress = (state: RootState) => state.chains.byAddress;
// Use like this: const chain = useAppSelector(state => selectChain(state, "aaa"))
export const selectChain = (state: RootState, address: Address): Chain | undefined =>
  state.chains.byAddress[address];

export const selectDefaultChain = (state: RootState): Chain | undefined => {
  const defAddress = selectDefaultChainAddr(state);
  if (defAddress) {
    return selectChain(state, defAddress);
  } else {
    return undefined;
  }
}

export const selectHead = (state: RootState, chainAddr: Address) => {
  const chain = state.chains.byAddress[chainAddr];
  return chain && chain.slots.finalizedBlocks[chain.slots.finalizedBlocks.length - 1];
}

export const selectChainName = (state: RootState, address: Address): string | undefined =>
  (selectChain(state, address))?.name;


export const selectChainState = (state: RootState, chainAddr: Address) => {
  return (selectHead(state, chainAddr))?.state;
}

export default chainsSlice.reducer;
