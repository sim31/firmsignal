import { configureStore, type ThunkAction, type Action } from '@reduxjs/toolkit'
import appLocation, { setLocation } from './slices/appLocation.js'
import chains, { init as chainsInit } from './slices/chains.js'
// import chains from './slices/chains.js'
import accounts, { loadWallet } from './slices/accounts.js'
import status, { setStatusAlert } from './slices/status.js'
import appState from './slices/appState.js'
import anyToStr from 'firmcore/src/helpers/anyToStr.js'
import { init as walletsInit } from './wallets.js';
import fc, { IFirmCore } from 'firmcore';
import { DependencyMissing } from 'firmcore/src/exceptions/DependencyMissing.js'
import mounts, { init as mountsInit } from './slices/mounts.js'

export const store = configureStore({
  reducer: {
    appLocation,
    chains,
    accounts,
    mounts,
    status,
    appState
  }
})

async function initFc(): Promise<IFirmCore> {
  try {
    await store.dispatch(mountsInit()).unwrap();

    store.dispatch(setStatusAlert({
      status: 'info',
      msg: 'Loading... (you may have to login through metamask)'
    }))
    try {
      await fc.init(undefined, true);
    } catch (err: unknown) {
      if (err instanceof DependencyMissing) {
        store.dispatch(setStatusAlert({
          status: 'info',
          msg: 'Have to deploy dependencies. Sign deployement transactions with Metamask to continue...'
        }));
        await fc.init();
      } else {
        throw err;
      }
    }

    await walletsInit();
    await store.dispatch(loadWallet()).unwrap();
    await store.dispatch(chainsInit()).unwrap();
    store.dispatch(setStatusAlert({ status: 'none' }))
    return fc;
  } catch (err: any) {
    const errStr = anyToStr(err);
    // TODO: why does it complain
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    const str = `Failed initializing firmcore: ${errStr}`;
    console.error(str);
    store.dispatch(setStatusAlert({
      status: 'error',
      msg: str
    }));
    throw err;
  }
}

const fcPromise = initFc();

export async function getFirmcore(): Promise<IFirmCore> {
  return await fcPromise;
}

/**
 * This syncs:
 * * window location
 * * state of appLocation
 * * currently selected chain
 */
function initLocationSync () {
  // Update Redux if we navigated via browser's back/forward
  // most browsers restore scroll position automatically
  // as long as we make content scrolling happen on document.body
  window.addEventListener('popstate', () => {
    // here `doUpdateUrl` is an action creator that
    // takes the new url and stores it in Redux.
    store.dispatch(setLocation(window.location.pathname))
  })

  store.subscribe(() => {
    const { pathname } = store.getState().appLocation
    // eslint-disable-next-line no-restricted-globals
    if (location.pathname !== pathname) {
      window.history.pushState(null, '', pathname)
      // Force scroll to top this is what browsers normally do when
      // navigating by clicking a link.
      // Without this, scroll stays wherever it was which can be quite odd.
      document.body.scrollTop = 0
    }
  })
}

function initErrorListener() {
  store.subscribe(() => {
    const state = store.getState();
    const error = state.chains.error;
    const alert = state.status.alert
    if (error === undefined || ('msg' in alert && error === alert.msg)) {
      // eslint-disable-next-line no-useless-return
      return;
    } else {
      console.error('chains store error: ', error);
      store.dispatch(setStatusAlert({
        status: 'error',
        msg: error
      }))
    }
  });
}

initErrorListener();
initLocationSync();

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export type AppThunk<ReturnType = void> = ThunkAction<
ReturnType,
RootState,
unknown,
Action<string>
>
