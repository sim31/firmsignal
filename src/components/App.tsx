import React, { useEffect } from 'react'
import FirmBar from './FirmBar.js'
import { Alert, CssBaseline } from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import {
  setLocation
} from '../global/slices/appLocation.js'
import { selectFocusChainPoint, selectInitStatus } from '../global/slices/chains.js'
import { useAppSelector, useAppDispatch, useRouteMatcher } from '../global/hooks.js'
import { rootRouteMatcher } from '../global/routes.js'
import { selectStatusAlert } from '../global/slices/status.js'
import { getRouteParam } from '../helpers/routes.js'

const theme = createTheme()

function App () {
  const dispatch = useAppDispatch()
  const routeMatch = useRouteMatcher(rootRouteMatcher)
  const focusChain = useAppSelector(selectFocusChainPoint)
  const alert = useAppSelector(selectStatusAlert)
  const initStatus = useAppSelector(selectInitStatus);

  // Create a wallet if there's none

  // Redirect to /createChain or defaultChain if location is '/'
  useEffect(() => {
    if (initStatus === 'ready') {
      if (routeMatch.value == null) {
        if (focusChain == null) {
          dispatch(setLocation('/newChain'))
        } else {
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          dispatch(setLocation(`/chains/${focusChain.cidStr}`))
        }
      } else {
        // Ensure that we are always at focus chain location
        const chainId = getRouteParam(routeMatch, 'chainId');
        if (chainId !== undefined && focusChain !== undefined) {
          if (chainId !== focusChain.cidStr) {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            dispatch(setLocation(`/chains/${focusChain.cidStr}`))
          }
        }
      }
    }
  }, [routeMatch, dispatch, focusChain, initStatus])

  const Component = initStatus === 'ready' ? routeMatch.value : null;

  return (
    <ThemeProvider theme={theme}>
      <>
        <CssBaseline />
        <FirmBar />
        { alert.status !== 'none'
          ? <Alert
            severity={alert.status}
            sx={{
              width: '100%',
              justifyContent: 'center',
              alignContent: 'center',
              margin: 0
            }}
          >
            {alert.msg}
          </Alert>
          : null
        }
        {(Component != null) ? <Component /> : null}
      </>
    </ThemeProvider>
  )
}

export default App
