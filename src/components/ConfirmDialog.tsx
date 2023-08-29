import * as React from 'react'
import { shortBlockId } from '../helpers/hashDisplay.js'
import { useAppDispatch, useAppSelector } from '../global/hooks.js'
import { useCallback } from 'react'
import { type ConfirmBlockArgs } from '../global/slices/chains.js'
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'
import { confirmBlock, setConfirmDialogClose, selectConfirmDialogArgs } from '../global/slices/appState.js'

export default function ConfirmDialog () {
  const dialogArgs = useAppSelector(selectConfirmDialogArgs);
  const dispatch = useAppDispatch();

  const onAcceptClick = useCallback(() => {
    if (dialogArgs !== undefined) {
      const args: ConfirmBlockArgs = {
        confirmerAddr: dialogArgs.confirmerAddress,
        blockId: dialogArgs.block.id,
        chainAddress: dialogArgs.chainAddr
      };
      void dispatch(confirmBlock(args));
    }
  }, [dialogArgs, dispatch])

  const onCloseClick = useCallback(() => {
    dispatch(setConfirmDialogClose());
  }, [dispatch])

  return (
    <Dialog
      open={dialogArgs !== undefined}
      onClose={onCloseClick}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        Confirm block {dialogArgs !== undefined ? shortBlockId(dialogArgs.block.id) : ''}
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
        <Button onClick={onCloseClick}>No</Button>
      </DialogActions>
    </Dialog>
  )
}
