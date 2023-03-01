import { Card, Grid, Link, Stack, Typography } from '@mui/material';
import * as React from 'react';
import BalancesTable from './BalancesTable';
import BlockCard from './BlockCard';
import ConfirmerTable from './ConfirmerTable';
import StateInfoCard from './StateInfoCard';
import { selectChain } from '../global/slices/chains';
import { useAppSelector, useRouteMatcher } from '../global/hooks';
import { rootRouteMatcher } from '../global/routes';
import NotFoundError from './Errors/NotFoundError';

export default function FirmState() {
  const routeMatch = useRouteMatcher(rootRouteMatcher);
  const address = routeMatch.params ? routeMatch.params['chainId'] : '';
  const chain = useAppSelector(state => selectChain(state, address));

  if (!chain) {
    return <NotFoundError />
  }

  return (
    <Grid container spacing={6} sx={{ mt: '0.1em' }}>
      <Grid item xs={12}>
        <Grid container direction="row" spacing={6}>
          <Grid item>
            <BlockCard 
              num={6}
              id={'1b79dabklfb05cb167a5c24953eba58c4ac89b1adf57f28f2f9d09af107ee8f0'}
              date={'2023-02-11 13:01'}
              confirmations={1}
              threshold={4}
              totalWeight={6}
              tags={['proposed']}
            />
          </Grid>
          <Grid item>
            <BlockCard 
              num={6}
              id={'fk29c86dcfb05cb167a5c24953eba58c4ac89b1adf57f28f2f9d09af107ee8f0'}
              date={'2023-02-11 12:03'}
              confirmations={3}
              threshold={4}
              totalWeight={6}
              tags={['proposed']}
            />
          </Grid>
          <Grid item>
            <BlockCard 
              num={5}
              id={'9834876dcfb05cb167a5c24953eba58c4ac89b1adf57f28f2f9d09af107ee8f0'}
              date={'2023-02-10 12:03'}
              confirmations={4}
              threshold={4}
              totalWeight={6}
              tags={['consensus', 'view']}
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs="auto">
        <StateInfoCard title="Confirmers">
          <Typography>
            Threshold: {chain.threshold}
          </Typography>
          <ConfirmerTable confirmers={chain.confirmers}/>
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