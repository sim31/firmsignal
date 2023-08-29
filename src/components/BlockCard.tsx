import * as React from 'react'
import {
  Stack, Card, Box, CardActions, CardContent,
  Button, Typography
} from '@mui/material'
import { useCallback, useMemo } from 'react'
import { useAppDispatch, useAppSelector, useCopyCallback } from '../global/hooks.js'
import { type TaggedBlock, blockTagsStr } from '../utils/blockTags.js'
import { timestampToDateStr } from 'firmcore/src/helpers/date.js'
import { confirmationsText } from '../helpers/confirmationsDisplay.js'
import { shortBlockId } from '../helpers/hashDisplay.js'
import { selectCurrentAccount } from '../global/slices/accounts.js'
import { confirmDialogOpen, syncMounted } from '../global/slices/appState.js'
import { Address } from 'firmcore'
import { SyncChainArgs } from '../global/slices/chains.js'

export interface BlockCardProps {
  block: TaggedBlock
  chainAddr: Address
  insync?: boolean
  confirmButton?: boolean
  syncButton?: boolean
}

// Number
// Id
// Date
// Confirmers
// Proposals passed

export default function BlockCard ({ block, insync, syncButton, confirmButton, chainAddr }: BlockCardProps) {
  const dispatch = useAppDispatch()

  const userAddr = useAppSelector(selectCurrentAccount);

  const confirmText = useMemo(() => {
    // Genesis block does not need confirmations but it might have them
    if (block.tags[0] === 'genesis' && block.state.confirmationStatus.currentWeight === 0) {
      return null
    } else {
      return confirmationsText(block)
    }
  }, [block])

  const onConfirmClick = useCallback(
    () => {
      if (userAddr !== undefined) {
        dispatch(confirmDialogOpen({
          block,
          confirmerAddress: userAddr,
          chainAddr,
        }));
      }
    },
    [dispatch, userAddr, chainAddr, block],
  )

  const onSyncClick = useCallback(
    () => {
      const args: SyncChainArgs = {
        chainAddr,
        toBlock: block.id
      };
      void dispatch(syncMounted(args));
    },
    [dispatch, chainAddr, block],
  );

  const dateStr = useMemo(() => {
    return block.timestamp !== undefined ? timestampToDateStr(block.timestamp) : '';
  }, [block])

  const handleIdCopy = useCopyCallback(dispatch, block.id)

  const primaryColor = insync === true ? 'text.primary' : '#c2c2c2'
  const secondaryColor = insync === true ? 'text.secondary' : '#c2c2c2';
  if (insync !== true && confirmText !== null) {
    confirmText.color = '#c2c2c2';
  }

  return (
    <Card raised sx={{ width: '21em' }}>
      <CardContent>
        <Typography sx={{ fontSize: 14 }} color={secondaryColor} gutterBottom>
          {`#${block.height} `}
          {blockTagsStr(block.tags)}
        </Typography>
        {/* <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          {`${props.id}`}
        </Typography> */}
        <Typography variant="h5" component="div" color={primaryColor}>
          {dateStr}
        </Typography>
        { (confirmText != null) &&
          <Box sx={{ mb: 1.5 }}>
            <Typography component="span" color={secondaryColor}>
              Confirmations:
            </Typography>
            <span> </span>
            <Typography component="span" color={confirmText.color}>
              {confirmText.text}
            </Typography>
          </Box>
        }

        <Stack direction="row" spacing={1}>
          <Typography variant="body2" color={primaryColor}>
            id: {shortBlockId(block.id)}
          </Typography>
          <Button size='small' sx={{ padding: 0 }} onClick={handleIdCopy}>
            Copy
          </Button>
        </Stack>

        <Stack direction="row" spacing={1}>
          { block.msgs !== undefined &&
            <Typography variant="body2" color={primaryColor}>
              Messages: {block.msgs.length}
            </Typography>
          }
          <Button size='small' sx={{ padding: 0 }}>
            Show
          </Button>
        </Stack>

      </CardContent>
      <CardActions>
        {/* {props.tags[1] === 'view' ? null : <Button>Browse</Button>} */}
        { confirmButton === true && <Button onClick={onConfirmClick}>Confirm</Button> }
        { syncButton === true && <Button onClick={onSyncClick}>Sync</Button>}
      </CardActions>
    </Card>
  )
}
