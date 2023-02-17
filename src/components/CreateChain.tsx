import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Paper from '@mui/material/Paper';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
// import AddressForm from './AddressForm';
// import PaymentForm from './PaymentForm';
// import Review from './Review';


export default function CreateChain() {
 const [scType, setScType] = React.useState('fs-only');

  const handleScTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setScType((event.target as HTMLInputElement).value);
  };

  // function renderConfirmers() {
    
  // }

  return (
    <Container component="main" maxWidth="md" sx={{ mb: 4 }}>
      <Paper elevation={8} sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
        <Typography component="h1" variant="h4" align="center">
          Create a New Chain
        </Typography>
        {/* <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Smart contract
        </Typography> */}
        <Stack spacing={3}>
          <TextField
            required
            id="name"
            label="Name"
            variant="standard"
            sx={{ maxWidth: '14em' }}
          />
          <FormControl>
            <FormLabel>
              Smart Contract
              {/* <Typography component="h2" variant="h6">Smart contract</Typography> */}
            </FormLabel>
            <RadioGroup
              row
              name="radio-buttons-group"
              value={scType}
              onChange={handleScTypeChange}
            >
              <FormControlLabel value="fs-only" control={<Radio />} label="Filesystem smart contract" />
              <FormControlLabel value="fs-token" control={<Radio />} label="Filesystem and token" />
            </RadioGroup>
          </FormControl>

          <TextField
            required
            type="number"
            id="threshold"
            label="Threshold"
            variant="standard"
            sx={{ width: '6em' }}
          />

          <Stack direction="row" spacing={1}>
            <IconButton aria-label="delete" sx={{ padding: 0, mt: '0.5em' }}>
              x
            </IconButton>
            <TextField
              required
              label="Name"
              variant="standard"
              sx={{ width: '14em' }}
            />
            <TextField
              required
              label="Address"
              variant="standard"
              fullWidth
            />
            <TextField
              required
              type="number"
              label="Weight"
              variant="standard"
              sx={{ width: '6em' }}
            />
          </Stack>

          <Stack direction="row" spacing={1}>
            <IconButton aria-label="delete" sx={{ padding: 0, mt: '0.5em' }}>
              x
            </IconButton>
            <TextField
              required
              label="Name"
              variant="standard"
              sx={{ width: '14em' }}
            />
            <TextField
              required
              label="Address"
              variant="standard"
              fullWidth
            />
            <TextField
              required
              type="number"
              label="Weight"
              variant="standard"
              sx={{ width: '6em' }}
            />
          </Stack>

          <Button>Add confirmer</Button>

        </Stack>
        
      </Paper>
    </Container>
  );
}