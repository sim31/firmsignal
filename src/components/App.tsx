import React, { useEffect } from 'react'
import FirmBar from './FirmBar'
import { Alert, CssBaseline } from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import {
  setLocation
} from '../global/slices/appLocation'
import { selectDefaultChain } from '../global/slices/chains'
import { useAppSelector, useAppDispatch, useRouteMatcher } from '../global/hooks'
import { rootRouteMatcher } from '../global/routes'
import { selectStatusAlert } from '../global/slices/status'
import { type EmotionJSX } from '@emotion/react/types/jsx-namespace'

const theme = createTheme()

function App (): EmotionJSX.Element {
  const dispatch = useAppDispatch()
  const routeMatch = useRouteMatcher(rootRouteMatcher)
  const defaultChain = useAppSelector(selectDefaultChain)
  const alert = useAppSelector(selectStatusAlert)

  // Create a wallet if there's none

  // Redirect to /createChain or defaultChain if location is '/'
  useEffect(() => {
    if (routeMatch.value == null) {
      if (defaultChain == null) {
        dispatch(setLocation('/newChain'))
      } else {
        dispatch(setLocation(`/chains/${defaultChain.address}`))
      }
    }
  }, [routeMatch, dispatch, defaultChain])

  const Component = routeMatch.value

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
