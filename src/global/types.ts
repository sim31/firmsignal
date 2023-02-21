import { ConfirmerOutput } from "firmcontracts/interface-helpers/types";

// Blocks
export type BlockStatus = 
  | 'consensus' // If this is the latest finalized block
  | 'past'      // If this block is finalized but not the latest
  | 'proposed'  // If this still has the chance to become finalized
  | 'orphaned'  // If alternative block at this height was finalized

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
  address: string,
  name?: string,
}

// Confirmers
export type FullConfirmerOutput = ConfirmerOutput & {
  name: string;
  ipnsAddr: string;
}
export type FullConfirmer = Omit<FullConfirmerOutput, keyof [string, number]>;

