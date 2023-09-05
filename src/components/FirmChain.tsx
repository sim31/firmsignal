import { Box, Container, Tab, Tabs, Typography } from '@mui/material'
import * as React from 'react'
import { useAppDispatch, useAppSelector, useRouteMatcher } from '../global/hooks.js'
import { chainRouteMatcher, rootRouteMatcher } from '../global/routes.js'
import { setLocation } from '../global/slices/appLocation.js'
import { selectChain, selectFocusChain } from '../global/slices/chains.js'
import { selectLoadingChain, setFocusChain } from '../global/slices/appState.js'
import NotFoundError from './Errors/NotFoundError.js'
import { useEffect, useState } from 'react'
import { getRouteParam } from '../helpers/routes.js'
import { shortAddress } from '../helpers/hashDisplay.js'
import { setStatusAlert, unsetAlert } from '../global/slices/status.js'
import { Address } from 'firmcore'
// import ShareIcon from '@mui/icons-material/Share';

export default function FirmChain () {
  const routeMatch = useRouteMatcher(chainRouteMatcher)
  const rootRouteMatch = useRouteMatcher(rootRouteMatcher)
  const tabValue = getRouteParam(rootRouteMatch, 'tab', '')
  const address = getRouteParam(routeMatch, 'chainId', '')
  const chain = useAppSelector(state => selectChain(state, address))
  const focusChain = useAppSelector(selectFocusChain);
  const loadingChain = useAppSelector(selectLoadingChain);
  const dispatch = useAppDispatch()

  const setTab = React.useCallback((tabValue: string) => {
    dispatch(setLocation(`/chains/${address}/${tabValue}`))
  }, [address, dispatch]);

  // For some reason, effect is sometimes called twice during a single re-render
  // Most likely, because of strict mode: https://react.dev/reference/react/StrictMode#enabling-strict-mode-for-entire-app
  // Using this "called" flag to prevent multiple dispatches
  let called: boolean = false;
  useEffect(() => {
    if (!called && focusChain?.address !== address && loadingChain !== address) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      called = true;
      void dispatch(setFocusChain(address));
    }
  }, [dispatch, address, focusChain, loadingChain])

  useEffect(() => {
    if (tabValue.length === 0) {
      setTab('overview')
    }
  }, [setTab, tabValue.length])

  const handleTabChange = React.useCallback((event: React.SyntheticEvent, newValue: string) => {
    setTab(newValue)
  }, [setTab])

  const Component = routeMatch.value

  if (chain == null) {
    if (loadingChain !== address) {
      return <NotFoundError />
    } else {
      <></>
    }
  } else if (chain.address !== focusChain?.address) {
    return <></>
  } else {
    return (
      <>
        <Typography variant="h4" align="center" sx={{ mt: '0.5em', mb: 0, paddingBottom: 0 }}>
          {chain.name ?? `Chain ${shortAddress(chain.address)}`}
        </Typography>
        {/* TODO: confirmations modal (shows which hierarchy of confirmers confirming selected block) */}
        {/* TODO: Remove browse buttons. It might be hard to implement and I think actions page will provide enough historic information for now */}

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          {/* TODO: Make sure all fit on smaller screens (introduce scrollbar (will have to remove centered) on smaller viewports) */}
          <Tabs value={tabValue.length > 0 ? tabValue : 'overview'} onChange={handleTabChange} centered>
            <Tab label="Overview" value="overview" />
            <Tab label="Records" value="blocks" />
            <Tab label="New Record" value="newBlock" />
            {/* <Tab label="History" value="blocks" /> */}
            {/* <Tab label="Propose" value="createProp" />
            <Tab label="Propose 2" value="createProp" /> */}
          </Tabs>
        </Box>
        <Container component="main" maxWidth="xl" sx={{ mb: '4em', ml: '2em', mr: '2em' }}>
          <Component />
        </Container>
      </>
    )
  }
}
