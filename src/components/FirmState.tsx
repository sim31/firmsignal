import { Card, Grid, Link, Stack, Typography } from '@mui/material';
import * as React from 'react';
import BalancesTable from './BalancesTable';
import BlockCard from './BlockCard';
import ConfirmerTable from './ConfirmerTable';
import StateInfoCard from './StateInfoCard';
import { selectChain, selectSlice } from '../global/slices/chains';
import { useAppSelector, useCurrentChainRoute, useLatestBlocks, useRouteMatcher } from '../global/hooks';
import { rootRouteMatcher } from '../global/routes';
import NotFoundError from './Errors/NotFoundError';
import { BlockTags, Chain } from '../global/types';
import { EmotionJSX } from '@emotion/react/types/jsx-namespace';
import { getBlockId } from 'firmcontracts/interface/abi';
import { BlockIdStr, OptExtendedBlockValue, } from 'firmcontracts/interface/types';
import { useMemo } from 'react';
import { TupleType } from 'typescript';
import { blocksWithConfirmInfo, withConfirmInfo } from 'firmcontracts/interface/firmchain';

export default function FirmState() {
  const { filledBlocks, blockTags, state} = useLatestBlocks(6);

  function renderBlockList() {
    if (filledBlocks && blockTags) {
      return filledBlocks.map((bl, index) => {
        return (
          <Grid item key={bl.state.blockId}>
            <BlockCard 
              block={bl}
              // TODO: implement block tags
              tags={blockTags[index] ?? ['proposed']}
            />
          </Grid>
        );
      });
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
            Threshold: {state?.confirmerSet.threshold ?? '-'}
          </Typography>
          {
            state?.confirmerSet.confirmers ?
            <ConfirmerTable
              confirmers={state.confirmerSet.confirmers}
              accounts={state.accounts || {}}
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