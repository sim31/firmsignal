import { createAsyncThunk, createSlice, } from '@reduxjs/toolkit'
import { type RootState } from '../store'
import { type Address } from 'firmcore'
import { loadConfirmer } from '../wallets'

export interface Accounts {
  // TODO: retrieve account addresses from wallet manager (requires a thunk)
  currentAccount?: Address
}

const initialState: Accounts = {}

export const loadWallet = createAsyncThunk(
  'accounts/loadWallet',
  async (): Promise<Address> => {
    const confirmer = await loadConfirmer();
    return confirmer.address;
  }
)

export const accountsSlice = createSlice({
  name: 'accounts',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadWallet.fulfilled, (state, action) => {
        state.currentAccount = action.payload;
      })
  }
});

export const selectCurrentAccount = (state: RootState): Address | undefined =>
  state.accounts.currentAccount

export default accountsSlice.reducer
