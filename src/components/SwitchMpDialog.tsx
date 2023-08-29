import * as React from 'react'
import { shortBlockId } from '../helpers/hashDisplay.js'
import { useAppDispatch, useAppSelector } from '../global/hooks.js'
import { useCallback } from 'react'
import { type ConfirmBlockArgs } from '../global/slices/chains.js'
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'
import { confirmBlock, setSwitchMpDialogClose, selectSwitchMpDialogArgs, mountChain } from '../global/slices/appState.js'

export default function SwitchMpDialog () {
  const dialogArgs = useAppSelector(selectSwitchMpDialogArgs);
  const dispatch = useAppDispatch();

  const onSwitchClick = useCallback(() => {
    if (dialogArgs !== undefined) {
      void dispatch(mountChain(dialogArgs.toChainId));
    }
  }, [dialogArgs, dispatch])

  const onCloseClick = useCallback(() => {
    dispatch(setSwitchMpDialogClose());
  }, [dispatch])

  return (
    <Dialog
      open={dialogArgs !== undefined}
      onClose={onCloseClick}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        Switch to host network?
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          This chain has another network set as home, than the currently selected network in metamask. You need to switch to home network before confirming.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onSwitchClick}>
          Switch
        </Button>
        <Button onClick={onCloseClick}>Cancel</Button>
      </DialogActions>
    </Dialog>
  )
}
