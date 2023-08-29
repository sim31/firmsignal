import { createAsyncThunk } from '@reduxjs/toolkit';
import type { AppDispatch, RootState } from './store.js';

export const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: RootState
  dispatch: AppDispatch
  rejectValue: string
  extra: unknown
}>();
