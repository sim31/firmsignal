import React, { useCallback, useState } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { useImmer } from 'use-immer'
import useIncrementingId from '../hooks/useIncrementingId'
import { useAppDispatch } from '../global/hooks'
import { createChain } from '../global/slices/chains'
import { setLocation } from '../global/slices/appLocation'
import { setStatusAlert, unsetAlert } from '../global/slices/status'
import type { AccountWithAddress, EFConstructorArgs } from 'firmcore'
import type { Overwrite } from 'utility-types'
import { type EmotionJSX } from '@emotion/react/types/jsx-namespace'

type ConfirmerEntry = Overwrite<AccountWithAddress, { id: string, extAccounts: string }>

export default function CreateChain (): EmotionJSX.Element {
  const dispatch = useAppDispatch();
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const newConfirmerId = useIncrementingId('confirmer');

  const newConfirmerEntry = useCallback<() => ConfirmerEntry>(() => {
    return {
      id: newConfirmerId(),
      address: '',
      name: '',
      extAccounts: ''
    }
  }, [newConfirmerId])

  const [confirmers, updateConfirmers] = useImmer<Record<string, ConfirmerEntry>>(() => {
    const conf = newConfirmerEntry();
    return {
      [conf.id]: conf,
    }
  });

  const onNameChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  }, [setName]);

  const onSymbolChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSymbol(event.target.value);
  }, [setSymbol]);

  const onConfirmerChange = useCallback(
    (
      value: string,
      property: Exclude<keyof ConfirmerEntry, 'id'>,
      confirmerId: string
    ) => {
      updateConfirmers(confirmers => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        confirmers[confirmerId]![property] = value.toString();
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
      updateConfirmers(confirmers => {
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
        dispatch(setStatusAlert({
          status: 'info',
          msg: 'Creating firmchain...',
        }));

        const confs: AccountWithAddress[] =
          Object.values(confirmers).map(c => {
            return {
              ...c,
              id: 0,
              extAccounts: {
                ipns: c.extAccounts
              }
            }
          });
        const args: EFConstructorArgs = {
          confirmers: confs,
          name,
          symbol,
        };
        const chain = await dispatch(createChain(args)).unwrap();
        dispatch(unsetAlert());
        dispatch(setLocation(`/chains/${chain.address}`));
      } catch (err) {
        console.log(err);
        const msg = typeof err === 'object' && err !== null && 'message' in err ? err.message : err;
        dispatch(setStatusAlert({
          status: 'error',
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          msg: `Failed creating new chain. Error: ${msg}`
        }));
      }
    },
    [confirmers, dispatch, name, symbol]
  )

  function renderConfirmers (): EmotionJSX.Element[] {
    return Object.values(confirmers).map((confirmer) => {
      return (
        <Stack direction="row" spacing={1} key={confirmer.id}>
          <IconButton
            aria-label="delete"
            sx={{ padding: 0, mt: '0.8em', mr: '0.5em' }}
            onClick={() => { onRemoveConfirmer(confirmer.id) }}
          >
            x
          </IconButton>
          <TextField
            required
            label="Name"
            variant="standard"
            sx={{ width: '20em' }}
            value={confirmer.name}
            onChange={e => { onConfirmerChange(e.target.value, 'name', confirmer.id) }}
          />
          <TextField
            required
            label="Address"
            variant="standard"
            fullWidth
            value={confirmer.address}
            onChange={e => { onConfirmerChange(e.target.value, 'address', confirmer.id) }}
          />
          {/* <TextField
            label="IPNS address"
            variant="standard"
            fullWidth
            value={confirmer.extAccounts}
            onChange={e => { onConfirmerChange(e.target.value, 'extAccounts', confirmer.id) }}
          /> */}
        </Stack>
      );
    });
  }

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
          <Stack spacing={3} direction='row'>
            <TextField
              required
              id="name"
              label="Name"
              variant="standard"
              sx={{ maxWidth: '14em' }}
              value={name}
              onChange={onNameChange}
            />

            {/* <TextField
              required
              id="symbol"
              label="Symbol"
              variant="standard"
              sx={{ maxWidth: '8em' }}
              value={symbol}
              onChange={onSymbolChange}
            /> */}

          </Stack>

          {renderConfirmers()}

          <Button size="medium" color="secondary" onClick={onAddConfirmer}>Add confirmer</Button>

          <Box
            m={1}
            display="flex"
            justifyContent="flex-end"
            alignItems="flex-end"
          >
            <Button
              size="large"
              color="primary"
              sx={{ mr: 2, fontSize: 18 }}
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
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
