import { configureStore, type ThunkAction, type Action } from '@reduxjs/toolkit'
import appLocation, { setLocation } from './slices/appLocation.js'
import chains from './slices/chains.js'
import accounts, { loadWallet } from './slices/accounts.js'
import status, { setStatusAlert } from './slices/status.js'
import anyToStr from 'firmcore/src/helpers/anyToStr.js'
import { init as walletsInit } from './wallets.js';
import fcManager from 'firmcore';

export const store = configureStore({
  reducer: {
    appLocation,
    chains,
    accounts,
    status
  }
})

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

async function initFc() {
  try {
    store.dispatch(setStatusAlert({
      status: 'info',
      msg: 'Loading...'
    }))
    await fcManager.get();
    await walletsInit();
    await store.dispatch(loadWallet());
    store.dispatch(setStatusAlert({ status: 'none' }))
    // TODO: dispatch action to initialize chain list
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
  }
}

initLocationSync();
void initFc();

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export type AppThunk<ReturnType = void> = ThunkAction<
ReturnType,
RootState,
unknown,
Action<string>
>
