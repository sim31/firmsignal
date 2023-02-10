import React from 'react';
import logo from './logo.svg';
import FirmBar from './FirmBar';
import { CssBaseline } from '@mui/material';
import CreateChain from './CreateChain';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import FirmState from './FirmState';
import { FirmChain } from './FirmChain';
import FirmHistory from './FirmHistory';

const theme = createTheme();

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <FirmBar />
      {/* <CreateChain /> */}
      <FirmChain />
    </ThemeProvider>
  );
}

export default App;
