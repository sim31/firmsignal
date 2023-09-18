import { Button, Card, Grid, Link, Stack, Typography } from '@mui/material'
import * as React from 'react'
import BalancesTable from './BalancesTable.js'
import BlockCard from './BlockCard.js'
import ConfirmerTable from './ConfirmerTable.js'
import StateInfoCard from './StateInfoCard.js'
import { useAppDispatch, useAppSelector, useCopyCallback, useLatestBlocks } from '../global/hooks.js'
import { useMemo } from 'react'
import firmcore, { BlockId, type Account, type Address } from 'firmcore'
import { isFullChain } from '../global/slices/chains.js'
import { selectCurrentAccount } from '../global/slices/accounts.js'
import { selectCurrentMountpointId } from '../global/slices/mounts.js'

export default function FirmState () {
  const { chain, headBlock, finalized, proposed } = useLatestBlocks(4);

  const account = useAppSelector(selectCurrentAccount);
  const mountpointId = useAppSelector(selectCurrentMountpointId);

  const dispatch = useAppDispatch();

  const handleIdCopy = useCopyCallback(dispatch, chain?.address ?? '');

  const directoryId = headBlock?.state.directoryId;
  // FIXME:
  const ipfsLink = directoryId !== undefined
    ? `ipfs://${directoryId}`
    : undefined;

  const hostChainId = headBlock?.state.hostChainId;

  const syncState = isFullChain(chain) ? chain.syncState : undefined;

  const confSet = headBlock?.state.confirmerSet
  // TODO: Move to some util or hook
  const accounts = useMemo(() => {
    const acc: Record<Address, Account> = {}
    const accountsByAddress = headBlock?.state.accountByAddress
    const accountsById = headBlock?.state.accountById
    if ((accountsByAddress != null) && (accountsById != null)) {
      for (const accountId of Object.values(accountsByAddress)) {
        const a = accountsById[accountId]
        if (a?.address !== undefined) {
          acc[a.address] = a
        }
      }
    }
    return acc
  }, [headBlock])

  function renderBlockList () {
    if (chain !== undefined && finalized !== undefined && syncState !== undefined) {
      const allBlocks = [...finalized, ...proposed]
      allBlocks.reverse()
      const accConfirmations: Record<number, BlockId> = {};
      const blockCards = allBlocks.map((bl) => {
        const confirmation = bl.state.confirmations.find(c => c === account);
        if (confirmation !== undefined) {
          accConfirmations[bl.height] = bl.id;
        }
        const insync = syncState.insyncBlocks > bl.height;
        const syncButton = !insync && bl.state.confirmationStatus.final;
        const confirmButton = accConfirmations[bl.height] === undefined && bl.height !== 0;
        return (
          <Grid item key={bl.id}>
            <BlockCard
              block={bl}
              chainAddr={chain.address}
              insync={insync}
              syncButton={syncButton}
              confirmButton={confirmButton}
              // TODO: implement block tags
            />
          </Grid>
        )
      })
      return blockCards
    } else {
      return []
    }
  }

  return (
    <Grid container spacing={6} sx={{ mt: '0.1em' }}>
      <Grid item xs={12}>
        <Grid container direction="row" spacing={6}>
          {renderBlockList()}
        </Grid>
      </Grid>

      { chain !== undefined &&
        <Grid item xs="auto">
          <StateInfoCard title="Chain Identifiers">
            <Stack direction="row" spacing={1}>
              <Typography>
                Address: {chain.address}
              </Typography>
              <Button size='small' sx={{ padding: 0 }} onClick={handleIdCopy}>
                Copy
              </Button>
            </Stack>
            <Typography>
              Name: {chain.name}
            </Typography>
            <Typography>
              Symbol: {chain.symbol}
            </Typography>
          </StateInfoCard>
        </Grid>
      }

      <Grid item xs="auto">
        <StateInfoCard title="Confirmers">
          <Typography>
            Threshold: {confSet?.threshold ?? '-'}
          </Typography>
          {
            ((confSet?.confirmers) != null)
              ? <ConfirmerTable
                  confirmers={Object.values(confSet.confirmers)}
                  accounts={accounts}
                />
              : '-'
          }
        </StateInfoCard>
      </Grid>
      {/* <Grid item xs="auto">
        <StateInfoCard title="Balances">
          <BalancesTable />
        </StateInfoCard>
      </Grid> */}
      { ipfsLink !== undefined &&
        <Grid item xs={12} md={6} lg={5}>
          <StateInfoCard title="Directory">
            <Typography noWrap>
              <Link
                href={ipfsLink}
                target='_blank'
                sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
              >
                {ipfsLink}
              </Link>
            </Typography>
          </StateInfoCard>
        </Grid>
      }

      { hostChainId !== undefined &&
        <Grid item xs="auto">
          <StateInfoCard title="Host Chain">
            <Typography>
              Chain id: {hostChainId}
            </Typography>
          </StateInfoCard>
        </Grid>
      }

      {/* <Grid item xs={12} md={6} lg={4} xl={3}>
        <StateInfoCard title="Chain Name">
          <Typography>EdenFractal</Typography>
        </StateInfoCard>
      </Grid> */}
    </Grid>
  )
}
