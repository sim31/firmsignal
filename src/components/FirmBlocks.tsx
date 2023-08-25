import * as React from 'react'
import { Button, Grid, Stack, styled, Typography, Tabs, Tab, Box } from '@mui/material'
import { useAppDispatch, useAppSelector, useCopyCallback, useLatestBlocks } from '../global/hooks.js'
import { getRouteParam } from '../helpers/routes.js'
import { setLocation } from '../global/slices/appLocation.js'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { confirmationsText } from '../helpers/confirmationsDisplay.js'
import { msgTypes } from '../global/messages.js'
import { blockTagsStr } from '../utils/blockTags.js'
import { timestampToDateStr } from 'firmcore/src/helpers/date.js'
import ConfirmDialog from './ConfirmDialog.js'
import { shortBlockId } from '../helpers/hashDisplay.js'
import { selectCurrentAccount } from '../global/slices/accounts.js'
import { confirmBlock, type ConfirmBlockArgs } from '../global/slices/chains.js'
import { setStatusAlert, unsetAlert } from '../global/slices/status.js'

const BlockTabs = styled(Tabs)({
  '& .MuiButtonBase-root': {
    textTransform: 'none'
  }
})

export default function FirmBlocks () {
  const { finalized, proposed, headBlock, routeMatch, chain } = useLatestBlocks()
  const selectedBlockId = getRouteParam(routeMatch, 'block', '')
  const dispatch = useAppDispatch()
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false)
  const accountAddr = useAppSelector(selectCurrentAccount)

  const [block, confirmText] = useMemo(() => {
    if (selectedBlockId.length > 0) {
      let bl = finalized.find((bl) => bl.id === selectedBlockId)
      if (bl == null) {
        bl = proposed.find((bl) => bl.id === selectedBlockId)
      }
      return (bl != null) ? [bl, confirmationsText(bl)] : [undefined, undefined]
    } else {
      return [undefined, undefined]
    }
  }, [finalized, proposed, selectedBlockId])

  const selectBlock = useCallback((tabValue: string) => {
    if (chain !== undefined) {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      dispatch(setLocation(`/chains/${chain.address}/blocks/${tabValue}`));
    } else {
      dispatch(setLocation('/'));
    }
  }, [chain, dispatch]);

  useEffect(() => {
    if (selectedBlockId.length === 0 && (headBlock != null)) {
      selectBlock(headBlock.id)
    }
  }, [headBlock, selectBlock, selectedBlockId])

  const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: string) => {
    selectBlock(newValue)
  }, [selectBlock])

  const handleBlIdCopy = useCopyCallback(dispatch, selectedBlockId)

  const onConfirmClick = useCallback(() => {
    setConfirmOpen(true)
  }, [])

  const onConfirmAccept = useCallback(async (args: ConfirmBlockArgs) => {
    // TODO: Show error if not enough information (like threshold not set)
    setConfirmOpen(false)
    try {
      // TODO: Spinner
      dispatch(setStatusAlert({
        status: 'info',
        msg: `Confirming block ${shortBlockId(args.blockId)}`
      }))

      await dispatch(confirmBlock(args)).unwrap()
      dispatch(unsetAlert())
    } catch (err) {
      console.log(err)
      const msg = typeof err === 'object' && (err != null) && 'message' in err ? err.message : err
      dispatch(setStatusAlert({
        status: 'error',
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        msg: `Failed Confirming a block. Error: ${msg}`
      }))
    }
  }, [dispatch])

  function renderLabel (num: number, tags: string, date?: string) {
    return (
      <>
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          {`#${num} `}
          {tags}
        </Typography>
        {date !== undefined &&
          <Typography variant="h5" component="div">
            {date}
          </Typography>
        }
      </>
    )
  }

  function renderBlockTabs () {
    return [...finalized, ...proposed].reverse().map((bl) => {
      const tagStr = blockTagsStr(bl.tags)
      const date = bl.timestamp !== undefined ? timestampToDateStr(bl.timestamp) : undefined;
      return (
        <Tab
          key={bl.id}
          label={renderLabel(bl.height, tagStr, date)}
          value={bl.id}
        />
      )
    })
  }

  function renderMessages () {
    if (block === undefined || block.msgs === undefined) {
      return
    }
    const msgs = Object.values(block.msgs).map((msg, index) => {
      const typeInfo = msgTypes[msg.name]
      const Component = typeInfo.displayComponent
      if (Component != null) {
        return (
          <Grid item key={index}>
            <Component msgNumber={index + 1} msg={msg}/>
          </Grid>
        )
      } else {
        return null
      }
    })

    return (
      <Grid container spacing={4} sx={{ mt: 0, paddingRight: 2 }}>
        {msgs}
      </Grid>
    )
  }

  return (
    <>
      <Box sx={{ width: '100%', margins: 'auto' }}>
        <BlockTabs
          value={selectedBlockId.length > 0 ? selectedBlockId : undefined}
          onChange={handleTabChange}
          // centered
          variant="scrollable"
          scrollButtons="auto"
          aria-label="scrollable auto tabs example"
        >
          {renderBlockTabs()}
        </BlockTabs>
      </Box>

      <Grid container spacing={2} justifyContent='space-between' sx={{ mt: 1 }}>
        {(block != null) &&
          <Grid item xs>
            <Stack direction="row" spacing={1}>
              <Typography component="span" color="text.secondary">
                id: {shortBlockId(block.id)}
              </Typography>
              <Button size='small' sx={{ padding: 0, mb: '2em' }} onClick={handleBlIdCopy}>
                Copy
              </Button>
            </Stack>
          </Grid>
        }

        {(block != null) &&
          <Grid item xs>
            <Typography component="span" color="text.secondary">
              Messages:
            </Typography>
            <span> </span>

            { block.msgs !== undefined &&
              <Typography component="span">{block.msgs.length}</Typography>
            }
          </Grid>
        }

        { (confirmText != null) &&
          <Grid item xs>
            <Typography component="span" color="text.secondary">
              Confirmations:
            </Typography>
            <span> </span>
            <Typography component="span" color={confirmText.color}>
              {confirmText.text}
            </Typography>
          </Grid>
        }

        {(block != null) &&
          <Grid item>
            {/* <Button size="large">Browse</Button> */}
            <Button size="large" sx={{ ml: '2em' }} onClick={onConfirmClick}>Confirm</Button>
          </Grid>
        }

      </Grid>

      {renderMessages()}

      {(block != null) && accountAddr !== undefined && (chain !== undefined) &&
        <ConfirmDialog
          open={confirmOpen}
          block={block}
          confirmerAddress={accountAddr}
          chainAddr={chain.address}
          onReject={() => { setConfirmOpen(false) }}
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onAccept={onConfirmAccept}
        />
      }

    </>
  )
}
