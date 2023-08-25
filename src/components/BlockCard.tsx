import * as React from 'react'
import {
  Stack, Card, Box, CardActions, CardContent,
  Button, Typography
} from '@mui/material'
import { useMemo } from 'react'
import { useAppDispatch, useCopyCallback } from '../global/hooks.js'
import { type TaggedBlock, blockTagsStr } from '../utils/blockTags.js'
import { timestampToDateStr } from 'firmcore/src/helpers/date.js'
import { confirmationsText } from '../helpers/confirmationsDisplay.js'
import { shortBlockId } from '../helpers/hashDisplay.js'

export interface BlockCardProps {
  block: TaggedBlock
}

// Number
// Id
// Date
// Confirmers
// Proposals passed

export default function BlockCard ({ block }: BlockCardProps) {
  const dispatch = useAppDispatch()

  const confirmText = useMemo(() => {
    // Genesis block does not need confirmations but it might have them
    if (block.tags[0] === 'genesis' && block.state.confirmationStatus.currentWeight === 0) {
      return null
    } else {
      return confirmationsText(block)
    }
  }, [block])

  // TODO: Check if current user account is confirmer and confirmed this block
  const confirmed = false

  const dateStr = useMemo(() => {
    return block.timestamp !== undefined ? timestampToDateStr(block.timestamp) : '';
  }, [block])

  const handleIdCopy = useCopyCallback(dispatch, block.id)

  return (
    <Card raised sx={{ width: '21em' }}>
      <CardContent>
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          {`#${block.height} `}
          {blockTagsStr(block.tags)}
        </Typography>
        {/* <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          {`${props.id}`}
        </Typography> */}
        <Typography variant="h5" component="div">
          {dateStr}
        </Typography>
        { (confirmText != null) &&
          <Box sx={{ mb: 1.5 }}>
            <Typography component="span" color="text.secondary">
              Confirmations:
            </Typography>
            <span> </span>
            <Typography component="span" color={confirmText.color}>
              {confirmText.text}
            </Typography>
          </Box>
        }

        <Stack direction="row" spacing={1}>
          <Typography variant="body2">
            id: {shortBlockId(block.id)}
          </Typography>
          <Button size='small' sx={{ padding: 0 }} onClick={handleIdCopy}>
            Copy
          </Button>
        </Stack>

        <Stack direction="row" spacing={1}>
          { block.msgs !== undefined &&
            <Typography variant="body2">
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
        {confirmed || block.tags[0] === 'orphaned' ? null : <Button>Confirm</Button>}
      </CardActions>
    </Card>
  )
}
