import { configureStore, type ThunkAction, type Action } from '@reduxjs/toolkit'
import appLocation from './slices/appLocation'
import chains from './slices/chains'
import accounts from './slices/accounts'
import status from './slices/status'

export const store = configureStore({
  reducer: {
    appLocation,
    chains,
    accounts,
    status
  }
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export type AppThunk<ReturnType = void> = ThunkAction<
ReturnType,
RootState,
unknown,
Action<string>
>
