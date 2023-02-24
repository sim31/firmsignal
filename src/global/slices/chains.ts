import { createAsyncThunk, createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AddressStr } from "firmcontracts/interface/types";
import { FirmChainConstrArgs, initFirmChain } from "../../contracts/contracts";
import { AppThunk, RootState } from "../store";
import { Chain } from "../types";
import { WritableDraft } from 'immer/dist/types/types-external';
import { getConfirmers } from "firmcontracts/interface/firmchain";

export interface Chains {
  byAddress: Record<AddressStr, Chain>;
  defaultChain?: AddressStr;
  status: 'idle' | 'loading' | 'success' | 'failed';
  error?: string;
}

const initialState: Chains = {
  byAddress: {},
  status: 'idle',
}

export const initChain = createAsyncThunk(
  'counter/initChain',
  async (args: FirmChainConstrArgs): Promise<Chain> => {
    const chain = await initFirmChain(args);
    const confirmers = await getConfirmers(chain);
    return {
      address: chain.address,
      confirmers,
    };
  }
);

function _addChain(state: WritableDraft<Chains>, chain: Chain) {
  // TODO: Proper validation of address
  if (chain.address.length && !state.byAddress[chain.address]) {
    state.byAddress[chain.address] = chain;
    if (!state.defaultChain) {
      state.defaultChain = chain.address;
    }
  }
}

export const chainsSlice = createSlice({
  name: 'chains',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    addChain: (state, action: PayloadAction<Chain>) => {
      _addChain(state, action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initChain.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(initChain.fulfilled, (state, action) => {
        state.status = 'success';
        _addChain(state, action.payload);
      })
      .addCase(initChain.rejected, (state) => {
        state.status = 'failed';
      });
  },
});


export const { addChain } = chainsSlice.actions;

export const selectDefaultChain = (state: RootState) => state.chains.defaultChain;
export const selectChainsByAddress = (state: RootState) => state.chains.byAddress;
// Use like this: const chain = useAppSelector(state => selectChain(state, "aaa"))
export const selectChain = (state: RootState, address: AddressStr) =>
  state.chains.byAddress[address];


export default chainsSlice.reducer;