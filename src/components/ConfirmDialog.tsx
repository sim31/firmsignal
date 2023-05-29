import * as React from 'react'
import { type TaggedBlock } from '../utils/blockTags.js'
import { shortBlockId } from '../helpers/hashDisplay.js'
import ShortenedBlockId from './ShortenedBlockId.js'
import { useAppDispatch } from '../global/hooks.js'
import { type Address } from 'firmcore/src/iwallet'
import { BlockId } from 'firmcore'
import { useCallback } from 'react'
import { type ConfirmBlockArgs } from '../global/slices/chains.js'
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'

export interface ConfirmDialogProps {
  open: boolean
  block: TaggedBlock
  confirmerAddress: Address
  chainAddr: Address
  onReject: () => void
  onAccept: (args: ConfirmBlockArgs) => void
}

export default function ConfirmDialog (props: ConfirmDialogProps) {
  const { open, block, confirmerAddress, onReject, onAccept, chainAddr } = props

  const onAcceptClick = useCallback(() => {
    onAccept({
      confirmerAddr: confirmerAddress,
      blockId: block.id,
      chainAddress: chainAddr
    })
  }, [onAccept, confirmerAddress, block.id, chainAddr])

  return (
    <Dialog
      open={open}
      onClose={onReject}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        Confirm block {shortBlockId(block.id)}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          By confirming you assert that this block represents consensus of the whole group
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onAcceptClick}>
          Yes, I believe this is consensus of our group
        </Button>
        <Button onClick={onReject}>No</Button>
      </DialogActions>
    </Dialog>
  )
}
