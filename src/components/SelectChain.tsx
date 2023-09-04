import React, { useCallback, useState } from 'react'
import { useImmer } from 'use-immer'
import useIncrementingId from '../hooks/useIncrementingId.js'
import { useAppDispatch, useAppSelector } from '../global/hooks.js'
import { createChain } from '../global/slices/appState.js'
import { setLocation } from '../global/slices/appLocation.js'
import { setStatusAlert, unsetAlert } from '../global/slices/status.js'
import type { AccountWithAddress, Address, EFConstructorArgs } from 'firmcore'
import type { Overwrite } from 'utility-types'
import { Box, Button, CardActions, Container, Grid, IconButton, Paper, Stack, TextField, Typography } from '@mui/material'
import { selectChainsByAddress } from '../global/slices/chains.js'
import ChainCard from './ChainCard.js'
import InfoCard from './InfoCard.js'
import { ethers } from 'ethers';

type ConfirmerEntry = Overwrite<AccountWithAddress, { id: string, extAccounts: string }>

export default function SelectChain () {
  const dispatch = useAppDispatch();
  const chains = useAppSelector(selectChainsByAddress);
  const [addrInput, setAddrInput] = useState('');

  const onAddrChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setAddrInput(event.target.value);
    },
    [setAddrInput],
  );

  const onSearchClick = useCallback(
    () => {
      if (!ethers.utils.isAddress(addrInput)) {
        dispatch(setStatusAlert({
          status: 'error',
          msg: 'Invalid address'
        }));
      } else {
        dispatch(setLocation(`/chains/${addrInput}`));
      }
    },
    [dispatch, addrInput],
  )

  const onSelect = useCallback(
    (address: Address) => {
      dispatch(setLocation(`/chains/${address}`));
    },
    [dispatch],
  )

  function renderChains() {
    return Object.entries(chains).map(([address, chain]) => {
      return (
        <Grid item xs="auto" key={address}>
          <ChainCard chain={chain} onSelect={() => { onSelect(address) }} />
        </Grid>
      )
    });
  }

  return (
    <Grid
      container
      component="main"
      maxWidth="xl"
      spacing={6} sx={{ mb: 4, mt: '2em', ml: '4em' }}
      justifyContent='center'
    >
      <Grid item xs={12} lg={10}>
        <Stack direction='row' spacing='1em'>
          <TextField label="Address" variant="outlined" value={addrInput} onChange={onAddrChange} fullWidth/>
          <Button onClick={onSearchClick}>Select</Button>
        </Stack>
      </Grid>

      { renderChains() }

    </Grid>
  )
}
