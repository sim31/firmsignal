import { AddressStr, ConfirmerValue, BlockIdStr, OptExtendedBlockValue, Account } from "firmcontracts/interface/types";
import { Wallet } from 'ethers';
import { AlertColor } from "@mui/material";

// Blocks
export type BlockStatus = 
  | 'consensus' // If this is the latest finalized block
  | 'past'      // If this block is finalized but not the latest
  | 'proposed'  // If this still has the chance to become finalized
  | 'orphaned'  // If alternative block at this height was finalized
  | 'genesis'   // If this is a genesis block
  | 'byzantine' // If this block is finalized but there's another finalized block

export type BlockTags = [BlockStatus, 'view'] | [BlockStatus];

export function blockTagsStr(tags: BlockTags): string {
  if (tags[1]) {
    return `block ${tags[0]} ${tags[1]}`;
  } else {
    return `block ${tags[0]}`;
  }
}

export type ActionStatus =
  | 'finalized'
  | 'proposed';

export function actionTagsStr(actionStatus: ActionStatus) {
  return `action ${actionStatus}`;
}

export function actionHeaderStr(actionId: string, actionStatus: ActionStatus) {
  return `#${actionId} ${actionTagsStr(actionStatus)}`;
}

// Chains
export interface Chain {
  address: AddressStr,
  genesisBlockId: BlockIdStr;
  headBlockId: BlockIdStr;
}

export type StatusAlert = {
  status: AlertColor | 'none';
  msg: string;
}

