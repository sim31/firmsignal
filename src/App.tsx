import React from 'react';
import logo from './logo.svg';
import FirmBar from './FirmBar';
import { CssBaseline } from '@mui/material';
import CreateChain from './CreateChain';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme();

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <FirmBar />
      <CreateChain />
    </ThemeProvider>
  );
}

export default App;
