import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AddressStr, Account } from "firmcontracts/interface/types";
import { getWallets } from "../../wallet";
import { RootState } from "../store";
import { normalizeHexStr } from "firmcontracts/interface/abi";

export interface Accounts {
  byAddress: Record<AddressStr, Account>;
  currentAccount?: AddressStr
}

const initialState: Accounts = {
  byAddress: getWallets().reduce<Accounts['byAddress']>((prevVal, wallet) => { 
    const normAddr = normalizeHexStr(wallet.address);
    return {
      ...prevVal,
      [normAddr]: {
        address: normAddr,
      }
    };
  }, {}),
};

export const accountsSlice = createSlice({
  name: 'accounts',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    setCurrentAccount(state, action: PayloadAction<AddressStr>) {
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
    return state.accounts.byAddress[addresses[0] as string];
  } else {
    return undefined;
  }
}
export const selectCurrentAccount = (state: RootState) =>
    state.accounts.currentAccount;
export const selectAccountByAddress = (state: RootState, address: AddressStr) => state.accounts.byAddress[address];
export const selectAccountsByAddress = (state: RootState) =>
  state.accounts.byAddress;

export default accountsSlice.reducer;