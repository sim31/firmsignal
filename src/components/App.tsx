import React, { useEffect } from 'react';
import logo from './logo.svg';
import FirmBar from './FirmBar';
import { CssBaseline } from '@mui/material';
import CreateChain from './CreateChain';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import FirmState from './FirmState';
import FirmHistory from './FirmHistory';
import {
  selectLocation,
  setLocation,
} from '../global/slices/appLocation';
import { selectChain, selectDefaultChain } from '../global/slices/chains';
import { useAppSelector, useAppDispatch, useRouteMatcher } from '../global/hooks';
import { rootRouteMatcher } from '../global/routes';

const theme = createTheme();

function App() {
  const dispatch = useAppDispatch();
  const routeMatch = useRouteMatcher(rootRouteMatcher);
  const defaultChain = useAppSelector(selectDefaultChain);

  // Redirect to /createChain or defaultChain if location is '/'
  useEffect(() => {
    if (!routeMatch.value) {
      if (!defaultChain) {
        dispatch(setLocation('/newChain'));
      } else {
        dispatch(setLocation(`/chains/${defaultChain}`))
      }
    }
  }, [routeMatch, dispatch, defaultChain])

  const Component = routeMatch.value;

  return (
    <ThemeProvider theme={theme}>
      <>
        <CssBaseline />
        <FirmBar />
        {Component ? <Component /> : null}
      </>
    </ThemeProvider>
  );
}

export default App;
