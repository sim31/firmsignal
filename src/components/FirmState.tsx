import { Card, Grid, Link, Stack, Typography } from '@mui/material';
import * as React from 'react';
import BalancesTable from './BalancesTable';
import BlockCard from './BlockCard';
import ConfirmerTable from './ConfirmerTable';
import StateInfoCard from './StateInfoCard';
import { useLatestBlocks } from '../global/hooks';
import { useMemo } from 'react';
import { Account, Address } from 'firmcore';

export default function FirmState() {
  const { chain, headBlock, finalized, proposed  } = useLatestBlocks();

  const confSet = headBlock?.state.confirmerSet;
  const confStatus = headBlock?.state.confirmationStatus;
  // TODO: Move to some util or hook
  const accounts = useMemo(() => {
    const acc: Record<Address, Account> = {};
    const accountsByAddress = headBlock?.state.accountByAddress;
    const accountsById = headBlock?.state.accountById;
    if (accountsByAddress && accountsById) {
      for (const accountId of Object.values(accountsByAddress)) {
        const a = accountsById[accountId];
        if (a && a.address) {
          acc[a.address] = a;
        }
      }
    }
    return acc;
  }, [headBlock])

  function renderBlockList() {
    if (chain) {
      const allBlocks = [ ...finalized, ...proposed ];
      allBlocks.reverse();
      const blockCards = allBlocks.map((bl) => {
        return (
          <Grid item key={bl.id}>
            <BlockCard 
              block={bl}
              // TODO: implement block tags
            />
          </Grid>
        );
      });
      return blockCards;
    } else {
      return [];
    }
  }

  return (
    <Grid container spacing={6} sx={{ mt: '0.1em' }}>
      <Grid item xs={12}>
        <Grid container direction="row" spacing={6}>
          {renderBlockList()}
        </Grid>
      </Grid>
      <Grid item xs="auto">
        <StateInfoCard title="Confirmers">
          <Typography>
            Threshold: {confSet?.threshold ?? '-'}
          </Typography>
          {
            confSet?.confirmers ?
            <ConfirmerTable
              confirmers={Object.values(confSet.confirmers)}
              accounts={accounts}
            />
            : '-'
          }
        </StateInfoCard>
      </Grid>
      <Grid item xs="auto">
        <StateInfoCard title="Balances">
          <BalancesTable />
        </StateInfoCard>
      </Grid>
      <Grid item xs={12} md={6} lg={4} xl={3}>
        <StateInfoCard title="Home Space">
          <Typography>rack two birds</Typography>
        </StateInfoCard>
      </Grid>
      <Grid item xs={12} md={6} lg={5}>
        <StateInfoCard title="Directory">
          <Typography noWrap>
            <Link href="ipfs://QmekpHNKhz7CcCLyP2MwbyerFutd9JL4KXveANy57vbHZq" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
              ipfs://QmekpHNKhz7CcCLyP2MwbyerFutd9JL4KXveANy57vbHZq
            </Link>
          </Typography>
        </StateInfoCard>
      </Grid>
      <Grid item xs={12} md={6} lg={4} xl={3}>
        <StateInfoCard title="Chain Name">
          <Typography>EdenFractal</Typography>
        </StateInfoCard>
      </Grid>
    </Grid>
  );

}