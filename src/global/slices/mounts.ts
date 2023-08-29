import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { createAppAsyncThunk as createAsyncThunk } from '../createAsyncThunk.js'
import fc, { ChainId, MountPoint } from 'firmcore'
import { waitForInit } from '../initWaiter.js';
import type { RootState } from '../store.js';

export type MountPointId = string;

export interface Mounts {
  mountpoints: Record<MountPointId, MountPoint>
  currentMountPoint?: MountPointId
}

const initialState: Mounts = {
  mountpoints: {},
}

export const chainsSlice = createSlice({
  name: 'mounts',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    setMountPoint: (state, action: PayloadAction<MountPoint>) => {
      state.mountpoints[action.payload.id] = action.payload;
      state.currentMountPoint = action.payload.id;
    }
  },
  // extraReducers: (builder) => {
  //   builder
  //     .addCase(init.fulfilled, (state, action) => {
  //       state.currentMountPoint = action.payload.currentMountPoint;
  //       state.mountpoints = action.payload.mountpoints;
  //     })
  // }
})

export const init = createAsyncThunk(
  'mounts/init',
  async (args: undefined, { dispatch }): Promise<void> => {
    fc.onMountPointChanged((mp) => {
      dispatch(chainsSlice.actions.setMountPoint(mp))
    });
  }
)

export const mountChain = createAsyncThunk(
  'mounts/mountChain',
  async (chainId: ChainId, { dispatch }): Promise<void> => {
    await fc.mountChain(chainId);
  }
)

// export const selectDefaultChainAddr = (state: RootState): Address | undefined => state.chains.byAddress[0];
export const selectMountpoints = (state: RootState): Record<MountPointId, MountPoint> => state.mounts.mountpoints;

export const selectCurrentMountpointId = (state: RootState): MountPointId | undefined => state.mounts.currentMountPoint;

export const selectCurrentMountpoint = (state: RootState): MountPoint | undefined => {
  if (state.mounts.currentMountPoint === undefined) {
    return undefined;
  } else {
    return state.mounts.mountpoints[state.mounts.currentMountPoint];
  }
}

export default chainsSlice.reducer;
