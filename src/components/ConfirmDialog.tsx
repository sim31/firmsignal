import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { TaggedBlock } from '../utils/blockTags';
import { shortBlockId } from '../helpers/hashDisplay';
import ShortenedBlockId from './ShortenedBlockId';
import { useAppDispatch } from '../global/hooks';
import { Address } from 'firmcore/src/iwallet';
import { BlockId } from 'firmcore';
import { useCallback } from 'react';
import { ConfirmBlockArgs } from '../global/slices/chains';

export type ConfirmDialogProps = {
  open: boolean,
  block: TaggedBlock,
  confirmerAddress: Address,
  chainAddr: Address, 
  onReject: () => void,
  onAccept: (args: ConfirmBlockArgs) => void,
};

export default function ConfirmDialog(props: ConfirmDialogProps) {
  const { open, block, confirmerAddress, onReject, onAccept, chainAddr } = props;

  const onAcceptClick = useCallback(() => {
    onAccept({
      confirmerAddr: confirmerAddress,
      blockId: block.id,
      chainAddress: chainAddr,
    });
  }, [onAccept, block, confirmerAddress]);

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
  );
}