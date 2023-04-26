import { Box, Container, Tab, Tabs, Typography } from '@mui/material';
import * as React from 'react';
import { useAppDispatch, useAppSelector, useRouteMatcher } from '../global/hooks';
import { chainRouteMatcher, rootRouteMatcher } from '../global/routes';
import { setLocation } from '../global/slices/appLocation';
import { selectChain, selectChainState } from '../global/slices/chains';
import NotFoundError from './Errors/NotFoundError';
import { useEffect } from 'react';
import { getRouteParam } from '../helpers/routes';
import { shortAddress } from '../helpers/hashDisplay';

export default function FirmChain() {
  const routeMatch = useRouteMatcher(chainRouteMatcher);
  const rootRouteMatch = useRouteMatcher(rootRouteMatcher);
  const tabValue = getRouteParam(rootRouteMatch, 'tab', '');
  const address = getRouteParam(routeMatch, 'chainId', '');
  const chain = useAppSelector(state => selectChain(state, address));
  const chainState = useAppSelector(state =>
    chain && selectChainState(state, chain.address));
  const dispatch = useAppDispatch();

  function setTab(tabValue: string) {
    dispatch(setLocation(`/chains/${address}/${tabValue}`));
  }

  useEffect(() => {
    if (!tabValue.length) {
      setTab('overview');
    }
  }, [])
  

  const handleTabChange = React.useCallback((event: React.SyntheticEvent, newValue: string) => {
    setTab(newValue);
  }, []);
  
  const Component = routeMatch.value;

  if (!chain) {
    return <NotFoundError />
  }

  return (
    <>
      <Typography variant="h4" align="center" sx={{ mt: '0.5em', mb: 0, paddingBottom: 0 }}>
        {chain.name ?? `Chain ${shortAddress(chain.address)}`}
      </Typography>
      {/* TODO: confirmations modal (shows which hierarchy of confirmers confirming selected block) */}
      {/* TODO: Remove browse buttons. It might be hard to implement and I think actions page will provide enough historic information for now */}

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        {/* TODO: Make sure all fit on smaller screens (introduce scrollbar (will have to remove centered) on smaller viewports) */}
        <Tabs value={tabValue.length ? tabValue : 'overview'} onChange={handleTabChange} centered>
          <Tab label="Overview" value="overview" />
          <Tab label="Directory" value="dir" />
          <Tab label="Proposals" value="proposals" />
          <Tab label="Confirmers" value="confirmers" />
          {/* <Tab label="History" value="blocks" /> */}
          {/* <Tab label="Propose" value="createProp" />
          <Tab label="Propose 2" value="createProp" /> */}
        </Tabs>
      </Box>
      <Container component="main" maxWidth="xl" sx={{ mb: '4em', ml: '2em', mr: '2em' }}>
        <Component />
      </Container>
    </>
  );
}