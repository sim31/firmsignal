import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk, RootState } from "../store";
import { walletManager, Address } from "firmcore";

export interface Accounts {
  // TODO: retrieve account addresses from wallet manager (requires a thunk)
  byAddress: Record<Address, {}>;
  currentAccount?: Address;
}

const initialState: Accounts = {
  byAddress: walletManager.getWalletAddresses().reduce((prev, current) => {
    return { ...prev, [current]: {} };
  }, {} as Record<Address, {}>)
};

export const accountsSlice = createSlice({
  name: 'accounts',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    setCurrentAccount(state, action: PayloadAction<Address>) {
      if (state.byAddress[action.payload]) {
        state.currentAccount = action.payload;
      }
    }
  },
});

export const { setCurrentAccount } = accountsSlice.actions;

export const selectDefaultAccount = (state: RootState) => {
  const addresses = Object.keys(state.accounts.byAddress);
  if (addresses.length) {
    return addresses[0];
  } else {
    return undefined;
  }
}
export const selectCurrentAccount = (state: RootState) =>
    state.accounts.currentAccount;
export const selectAccountByAddress = (state: RootState, address: Address) => state.accounts.byAddress[address];
export const selectAccountsByAddress = (state: RootState) =>
  state.accounts.byAddress;

export default accountsSlice.reducer;