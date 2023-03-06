import { Card, Grid, Link, Stack, Typography } from '@mui/material';
import * as React from 'react';
import BalancesTable from './BalancesTable';
import BlockCard from './BlockCard';
import ConfirmerTable from './ConfirmerTable';
import StateInfoCard from './StateInfoCard';
import { selectChain, selectSlice } from '../global/slices/chains';
import { useAppSelector, useCurrentChainRoute, useRouteMatcher } from '../global/hooks';
import { rootRouteMatcher } from '../global/routes';
import NotFoundError from './Errors/NotFoundError';
import { Chain } from '../global/types';
import { EmotionJSX } from '@emotion/react/types/jsx-namespace';
import { getBlockId } from 'firmcontracts/interface/abi';
import { BlockIdStr, OptExtendedBlockValue, } from 'firmcontracts/interface/types';
import { useMemo } from 'react';
import { TupleType } from 'typescript';
import { blocksWithConfirmInfo, withConfirmInfo } from 'firmcontracts/interface/firmchain';

export default function FirmState() {
  const { chain, routeMatch } = useCurrentChainRoute();
  const latestBls = useAppSelector(
    state => chain && selectSlice(state, chain.address, -6));

  const blocksAndIds = useMemo(() => {
    if (latestBls) {
      const bls = new Array<OptExtendedBlockValue>();
      if (latestBls[0]?.state.blockNum === 0) {
        bls.push(latestBls[0]);
      }
      bls.push(...blocksWithConfirmInfo(latestBls))
      bls.reverse();

      return bls?.map<[BlockIdStr, OptExtendedBlockValue]>((bl) => [getBlockId(bl.header), bl]);
    } else {
      return undefined;
    }
  }, [latestBls]);

  const headBl = blocksAndIds && blocksAndIds[0] && blocksAndIds[0][1];
  const state = headBl?.state;

  function renderBlockList() {
    if (blocksAndIds) {
      return blocksAndIds.map(([id, bl], index) => {
        const ts = bl.header.timestamp;
        const date = new Date(parseInt(ts.toString()) * 1000);
        return (
          <Grid item key={id}>
            <BlockCard 
              num={state?.blockNum ?? Number.NaN}
              id={id}
              date={date.toLocaleString()}
              confirmations={bl.state.confirmCount ?? 0}
              threshold={state?.confirmerSet.threshold ?? Number.NaN}
              totalWeight={bl.state.totalWeight ?? Number.NaN}
              messages={bl.msgs}
              // TODO: implement block tags
              tags={['proposed']}
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