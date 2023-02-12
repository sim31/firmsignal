import { Box, Container, Tab, Tabs, Typography } from '@mui/material';
import * as React from 'react';
import FirmHistory from './FirmHistory';
import FirmProposals from './FirmProposals';
import FirmState from './FirmState';

export function FirmChain() {
  const [tab, setTab] = React.useState('state');

  const handleTabChange = React.useCallback((event: React.SyntheticEvent, newValue: string) => {
    setTab(newValue);
  }, []);

  return (
    <>
      <Typography variant="h4" align="center" sx={{ mt: '0.5em', mb: 0, paddingBottom: 0 }}>
        Some Fractal
      </Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        {/* TODO: Make sure all fit on smaller screens (introduce scrollbar (will have to remove centered) on smaller viewports) */}
        <Tabs value={tab} onChange={handleTabChange} centered>
          <Tab label="Overview" value="state" />
          <Tab label="Directory" value="dir" />
          <Tab label="History" value="blocks" />
          <Tab label="Proposals" value="proposals" />
          <Tab label="Child orgs" value="children" />
          {/* <Tab label="Propose" value="createProp" />
          <Tab label="Propose 2" value="createProp" /> */}
        </Tabs>
      </Box>
      <Container component="main" maxWidth="xl" sx={{ mb: '4em', ml: '2em' }}>
        {/* <FirmState /> */}
        {/* <FirmHistory /> */}
        <FirmProposals />
      </Container>
    </>
  );
}