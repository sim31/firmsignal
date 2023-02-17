import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import appLocation from './slices/appLocation';
import chains from './slices/chains';

export const store = configureStore({
  reducer: {
    appLocation,
    chains,

  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;