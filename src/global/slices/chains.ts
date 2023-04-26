import { createAsyncThunk, createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk, RootState } from "../store";
import { WritableDraft } from 'immer/dist/types/types-external';
import assert from 'firmcore/src/helpers/assert';
import ProgrammingError from 'firmcore/src/exceptions/ProgrammingError';
import firmcore, { EFChainPODSlice, Address, EFConstructorArgs, NormEFChainPOD } from 'firmcore';

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

export const createChain = createAsyncThunk(
  'chains/createChain',
  async (args: EFConstructorArgs): Promise<Chain> => {
    const efChain = await firmcore.createEFChain(args);
    return efChain.getNormPODChain();
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
