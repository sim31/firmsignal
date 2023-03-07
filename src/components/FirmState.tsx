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
import { BlockTags, Chain } from '../global/types';
import { EmotionJSX } from '@emotion/react/types/jsx-namespace';
import { getBlockId } from 'firmcontracts/interface/abi';
import { BlockIdStr, OptExtendedBlockValue, } from 'firmcontracts/interface/types';
import { useMemo } from 'react';
import { TupleType } from 'typescript';
import { blocksWithConfirmInfo, withConfirmInfo } from 'firmcontracts/interface/firmchain';

export default function FirmState() {
  const { chain, routeMatch } = useCurrentChainRoute();
  // TODO: Move into 3 hook calls below into a hook and use in "Messages" as well
  const latestBls = useAppSelector(
    state => chain && selectSlice(state, chain.address, -6));

  const filledBlocks = useMemo(() => {
    if (latestBls) {
      const bls = new Array<OptExtendedBlockValue>();
      if (latestBls[0]?.state.blockNum === 0) {
        bls.push(latestBls[0]);
      }
      bls.push(...blocksWithConfirmInfo(latestBls))
      bls.reverse();

      return bls;
    } else {
      return undefined;
    }
  }, [latestBls]);

  const blockTags: BlockTags[] | undefined = useMemo(() => {
    const tags = filledBlocks?.map<BlockTags>(bl => ['proposed']);
    if (tags && filledBlocks) {
      let headIndex: number | undefined;
      for (const [index, bl] of filledBlocks.entries()) {
        if (bl.state.blockNum === 0) {
          tags[index] = ['genesis'];
        } else if (bl.state.confirmCount && bl.state.thresholdThis) {
          if (bl.state.confirmCount >= bl.state.thresholdThis) {
            if (!headIndex) {
              headIndex = index;
              tags[index] = ['consensus'];
            } else {
              const headBlockNum = filledBlocks[headIndex]?.state.blockNum;
              if (headBlockNum && headBlockNum > bl.state.blockNum) {
                tags[index] = ['past'];
              } else if (headBlockNum) {
                tags[headIndex] = tags[index] = ['byzantine'];
              } else {
                // Should never happen
                throw new Error('Invalid index set');
              }
            }
          } else {
            if (headIndex) {
              tags[index] = ['orphaned'];
            } else {
              tags[index] = ['proposed'];
            }
          }
        }
      }
    }
    return tags;
  }, [filledBlocks])

  const headBl = filledBlocks && filledBlocks[0];
  const state = headBl?.state;

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