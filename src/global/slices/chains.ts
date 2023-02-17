import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { Chain } from "../types";

export interface Chains {
  byAddress: Record<string, Chain>;
  defaultChain?: string;
}

const initialState: Chains = {
  byAddress: {},
}

export const appLocationSlice = createSlice({
  name: 'chains',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    addChain: (state, action: PayloadAction<Chain>) => {
      const chain = action.payload;
      // TODO: Proper validation of address
      if (chain.address.length && !state.byAddress[chain.address]) {
        state.byAddress[chain.address] = chain;
        if (!state.defaultChain) {
          state.defaultChain = chain.address;
        }
      }
    },
  },
});

export const { addChain } = appLocationSlice.actions;

export const selectDefaultChain = (state: RootState) => state.chains.defaultChain;
export const selectChainsByAddress = (state: RootState) => state.chains.byAddress;


export default appLocationSlice.reducer;