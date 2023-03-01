import React, { ChangeEvent, useCallback, useState } from 'react';
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
import Alert, { AlertColor } from '@mui/material/Alert';
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
import { useImmer } from 'use-immer';
import { FullConfirmer } from '../global/types';
import useIncrementingId from '../hooks/useIncrementingId';
import { stringify } from 'querystring';
import assert from '../helpers/assert';
import { useAppDispatch } from '../global/hooks';
import { initChain } from '../global/slices/chains';
import { setLocation } from '../global/slices/appLocation';
// import AddressForm from './AddressForm';
// import PaymentForm from './PaymentForm';
// import Review from './Review';

type ConfirmerEntry = FullConfirmer & { id: string };
type Alert = {
  status: AlertColor | 'none';
  msg: string;
}

export default function CreateChain() {
  const dispatch = useAppDispatch();
  const [scType, setScType] = useState('fs-only');
  const [name, setName] = useState('');
  const [threshold, setThreshold] = useState<number | undefined>(undefined);
  const newConfirmerId = useIncrementingId('confirmer'); 
  const [alert, setAlert] = useState<Alert>({
    status: 'none',
    msg: '',
  });
  const [alertMsg, setAlertMsg] = useState<string>('');

  const newConfirmerEntry = useCallback(() => {
    return {
      id: newConfirmerId(),
      addr: '',
      ipnsAddr: '',
      name: '',
      weight: -1,
    }
  }, [newConfirmerId]);

  const [confirmers, updateConfirmers] = useImmer<Record<string, ConfirmerEntry>>(() => {
    const conf = newConfirmerEntry();
    return {
      [conf.id]: conf,
    }
  });

  const onScTypeChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setScType(event.target.value);
    },
    [setScType]
  );

  const onNameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  }, [setName]);

  const onThresholdChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const n = parseInt(event.target.value);
      if (!isNaN(n) && n >= 0) {
        setThreshold(n);
      } else {
        setThreshold(undefined);
      }
    }, [setThreshold]
  );

  const onConfirmerChange = useCallback(
    (
      value: string,
      property: Exclude<keyof ConfirmerEntry, 'id'>,
      confirmerId: string
    ) => {
      updateConfirmers(confirmers => {
        if (property === 'weight') {
          const weight = parseInt(value);
          confirmers[confirmerId][property] = weight;
        } else {
          confirmers[confirmerId][property] = value.toString();
        }
      });
    },
    [updateConfirmers],
  );

  const onAddConfirmer = useCallback(
    () => {
      updateConfirmers(confirmers => {
        const conf = newConfirmerEntry();
        confirmers[conf.id] = conf;
      });
    },
    [updateConfirmers, newConfirmerEntry],
  )

  const onRemoveConfirmer = useCallback(
    (confirmerId: string) => {
      updateConfirmers(confirmers =>{
        delete confirmers[confirmerId];
      });
    },
    [updateConfirmers],
  )

  const onSubmit = useCallback(
    async () => {
      // TODO: Show error if not enough information (like threshold not set)
      try {
        // TODO: Spinner
        setAlert({
          status: 'info',
          msg: 'Creating firmchain...',
        });
        const args = {
          confirmers: Object.values(confirmers),
          threshold: threshold ?? 0,
          name,
        };
        const chain = await dispatch(initChain(args)).unwrap();

        dispatch(setLocation(`/chains/${chain.address}`));
      } catch(err) {
        console.log(err);
        setAlert({
          status: 'error',
          msg: `Failed creating new chain. Error: ${err}`
        });
      }
    },
    [confirmers, threshold],
  )
  


  function renderConfirmers() {
    return Object.values(confirmers).map((confirmer) => {
      return (
        <Stack direction="row" spacing={1} key={confirmer.id}>
          <IconButton 
            aria-label="delete"
            sx={{ padding: 0, mt: '0.8em', mr: '0.5em' }}
            onClick={() => onRemoveConfirmer(confirmer.id)}
          >
            x
          </IconButton>
          <TextField
            required
            label="Name"
            variant="standard"
            sx={{ width: '20em' }}
            value={confirmer.name}
            onChange={e => onConfirmerChange(e.target.value, 'name', confirmer.id)}
          />
          <TextField
            required
            label="Address"
            variant="standard"
            fullWidth
            value={confirmer.addr}
            onChange={e => onConfirmerChange(e.target.value, 'addr', confirmer.id)}
          />
          <TextField
            required
            type="number"
            label="Weight"
            variant="standard"
            sx={{ width: '12em' }}
            value={confirmer.weight >= 0 && !isNaN(confirmer.weight) ? confirmer.weight : ''}
            onChange={e => onConfirmerChange(e.target.value, 'weight', confirmer.id)}
          />
          <TextField
            label="IPNS address"
            variant="standard"
            fullWidth
            value={confirmer.ipnsAddr}
            onChange={e => onConfirmerChange(e.target.value, 'ipnsAddr', confirmer.id)}
          />
        </Stack>
      );
    });
  }

  return (
    <Container component="main" maxWidth="lg" sx={{ mb: 4 }}>
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
            value={name}
            onChange={onNameChange}
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
              onChange={onScTypeChange}
            >
              <FormControlLabel value="fs-only" control={<Radio />} label="Filesystem smart contract" />
              <FormControlLabel value="fs-token" control={<Radio />} label="Filesystem and token" />
            </RadioGroup>
          </FormControl>


          {/* TODO: Add helper text to say what you're setting */}
          <TextField
            required
            type="number"
            id="threshold"
            label="Threshold"
            variant="standard"
            sx={{ width: '6em' }}
            value={threshold}
            onChange={onThresholdChange}
          />

          {renderConfirmers()}

          <Button size="medium" color="secondary" onClick={onAddConfirmer}>Add confirmer</Button>

          <Box
            m={1}
           //margin
            display="flex"
            justifyContent="flex-end"
            alignItems="flex-end"
          >
            {alert.status === 'none'
              ? null : <Alert severity={alert.status}  sx={{ width: '100%' }}>{alert.msg}</Alert>
            }
            <Button
              size="large"
              color="primary"
              sx={{ mr: 2, fontSize: 18 }}
              onClick={onSubmit}
            >
              Submit
            </Button>
          </Box>

        </Stack>

        
      </Paper>
    </Container>
  );
}