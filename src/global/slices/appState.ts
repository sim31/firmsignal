import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { createAppAsyncThunk as createAsyncThunk } from '../createAsyncThunk.js';
import type { AppThunk, RootState } from '../store.js'
import {
  confirmBlock as chainConfirm,
  createBlock as chainCreateBlock,
  EFCreateBlockArgs, createChain as chainCreateChain,
  syncMounted as chainSyncMounted,
  selectChainState, ConfirmBlockArgs, SyncChainArgs,
  setFocusChain as chSetFocusChain,
} from './chains.js'
import { waitForInit } from '../initWaiter.js'
import { setStatusAlert, setTimedAlert, unsetAlert } from './status.js'
import { shortBlockId } from '../../helpers/hashDisplay.js'
import { TaggedBlock } from '../../utils/blockTags.js'
import { ProgrammingError } from 'firmcore/src/exceptions/ProgrammingError.js'
import { mountChain as mMountChain, MountPointId, selectCurrentMountpoint, selectCurrentMountpointId } from './mounts.js'
import { Address, ChainId, EFConstructorArgs } from 'firmcore';
import { setLocation } from './appLocation.js';

export interface ConfirmDialogArgs {
  block: TaggedBlock
  confirmerAddress: string
  chainAddr: string
}

export interface SwitchMpDialogArgs {
  toChainId: ChainId
}

export interface AppState {
  loadingChain?: Address
  confirmDialog: {
    open?: false
  } | {
    open: true
  } & ConfirmDialogArgs
  switchMpDialog: {
    open?: false
  } | {
    open: true
  } & SwitchMpDialogArgs
}

const initialState: AppState = {
  confirmDialog: {},
  switchMpDialog: {}
}

export const appStateSlice = createSlice({
  name: 'appState',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    setConfirmDialogOpen: (state, action: PayloadAction<ConfirmDialogArgs>) => {
      state.confirmDialog = {
        ...action.payload,
        open: true
      };
    },
    setConfirmDialogClose: (state) => {
      state.confirmDialog = { open: false };
    },
    setSwitchMpDialogOpen: (state, action: PayloadAction<SwitchMpDialogArgs>) => {
      state.switchMpDialog = { ...action.payload, open: true }
    },
    setSwitchMpDialogClose: (state) => {
      state.switchMpDialog = { open: false };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(setFocusChain.pending, (state, action) => {
        state.loadingChain = action.meta.arg;
      })
      .addCase(setFocusChain.fulfilled, (state, action) => {
        state.loadingChain = undefined;
      })
      .addCase(setFocusChain.rejected, (state, action) => {
        state.loadingChain = undefined;
      })
  }

})

interface UnknownError {
  err: unknown
  contextStr: string
}

export const handleUnknownError =
  (err: UnknownError): AppThunk =>
    (dispatch) => {
      console.log(err)
      const msg = JSON.stringify(err.err);
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      const fullErrMsg = `${err.contextStr}. Error: ${msg}`;
      dispatch(setStatusAlert({
        status: 'error',
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        msg: fullErrMsg
      }));
    }

export const confirmDialogOpen =
  (args: ConfirmDialogArgs): AppThunk =>
    (dispatch, getState) => {
      try {
        const state = getState();
        const match = selectCurrentMpMatch(state, args.chainAddr);
        if (match === undefined) {
          throw new Error('Don\'t have enough information about the chain to confirm it');
        }

        if (match.isMatch) {
          dispatch(appStateSlice.actions.setConfirmDialogOpen(args));
        } else {
          dispatch(appStateSlice.actions.setSwitchMpDialogOpen({
            toChainId: match.hostChainId
          }));
        }
      } catch (err) {
        dispatch(handleUnknownError({ contextStr: 'Error confirming', err }));
      }
    }

export const mountChain = createAsyncThunk(
  'appState/mountChain',
  async (chainId: ChainId, { dispatch, getState }): Promise<void> => {
    dispatch(setSwitchMpDialogClose());
    try {
      await dispatch(mMountChain(chainId)).unwrap()
    } catch (err) {
      dispatch(handleUnknownError({ contextStr: 'Error switching mountpoint', err }));
    }
  }
)

export const createBlock = createAsyncThunk(
  'appState/createBlock',
  async (args: EFCreateBlockArgs, { dispatch, getState }): Promise<void> => {
    try {
      const state = getState();
      const match = selectCurrentMpMatch(state, args.chainAddr);
      if (match === undefined) {
        throw new Error('Don\'t have enough information about the chain to confirm it');
      }

      if (match.isMatch) {
        // TODO: Spinner
        dispatch(setStatusAlert({
          status: 'info',
          msg: 'Creating a block...'
        }))

        await dispatch(chainCreateBlock(args)).unwrap()
        dispatch(unsetAlert())
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        dispatch(setLocation(`/chains/${args.chainAddr}`))
      } else {
        dispatch(appStateSlice.actions.setSwitchMpDialogOpen({
          toChainId: match.hostChainId
        }));
      }
    } catch (err) {
      dispatch(handleUnknownError({ contextStr: 'Error creating a block', err }));
    }
  }
)

export const setFocusChain = createAsyncThunk(
  'appState/setFocusChain',
  async (address: Address, { dispatch, getState }): Promise<void> => {
    try {
      // TODO: Spinner
      dispatch(setStatusAlert({
        status: 'info',
        msg: 'Loading firmchain...',
      }));

      await dispatch(chSetFocusChain(address)).unwrap();
      dispatch(unsetAlert());
    } catch (err) {
      dispatch(handleUnknownError({
        contextStr: 'Failed loading a chain',
        err
      }));
    }
  }
);

export const createChain = createAsyncThunk(
  'appState/createChain',
  async (args: EFConstructorArgs, { dispatch }): Promise<void> => {
    try {
      // TODO: Spinner
      dispatch(setStatusAlert({
        status: 'info',
        msg: 'Creating firmchain...',
      }));

      const chain = await dispatch(chainCreateChain(args)).unwrap();
      dispatch(unsetAlert());
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      dispatch(setLocation(`/chains/${chain.address}`));
    } catch (err) {
      dispatch(handleUnknownError({ contextStr: 'Failed creating a new chain', err }));
    }
  }
)

export const confirmBlock = createAsyncThunk(
  'appState/confirmBlock',
  async (args: ConfirmBlockArgs, { dispatch }): Promise<void> => {
    dispatch(setConfirmDialogClose());
    try {
      // TODO: Spinner
      dispatch(setStatusAlert({
        status: 'info',
        msg: `Confirming block ${shortBlockId(args.blockId)}`
      }))

      await dispatch(chainConfirm(args)).unwrap()
      dispatch(unsetAlert())
    } catch (err) {
      dispatch(handleUnknownError({ contextStr: 'Error confirming', err }));
    }
  }
)

export const syncMounted = createAsyncThunk(
  'appState/syncMounted',
  async (args: SyncChainArgs, { dispatch }): Promise<void> => {
    try {
      // TODO: Spinner
      dispatch(setStatusAlert({
        status: 'info',
        msg: 'Syncing... (continue in metamask)...'
      }));

      await dispatch(chainSyncMounted(args)).unwrap()
      dispatch(setTimedAlert({
        status: 'info',
        msg: 'Sync successful!'
      }))
    } catch (err) {
      dispatch(handleUnknownError({ contextStr: 'Error syncing', err }));
    }
  }
)

export const { setConfirmDialogClose, setSwitchMpDialogClose } = appStateSlice.actions;

export const selectConfirmDialogOpen = (state: RootState): boolean => {
  return state.appState.confirmDialog.open === true;
}

export const selectConfirmDialogArgs = (state: RootState): ConfirmDialogArgs | undefined =>
  state.appState.confirmDialog.open === true
    ? state.appState.confirmDialog
    : undefined;

export const selectSwitchMpDialogArgs = (state: RootState): SwitchMpDialogArgs | undefined =>
  state.appState.switchMpDialog.open === true
    ? state.appState.switchMpDialog
    : undefined;

export interface MatchStatus {
  isMatch: boolean
  hostChainId: ChainId
};
export const selectCurrentMpMatch = (state: RootState, chainAddr: Address): MatchStatus | undefined => {
  const chainState = selectChainState(state, chainAddr);
  if (chainState === undefined) {
    return undefined;
  }
  const hostChainId = chainState.hostChainId;
  const mp = selectCurrentMountpoint(state);
  return {
    isMatch: hostChainId === mp?.chainId,
    hostChainId
  }
}

export const selectLoadingChain = (state: RootState): Address | undefined => {
  return state.appState.loadingChain;
}

export default appStateSlice.reducer;
