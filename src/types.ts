
export type BlockStatus = 
  | 'consensus' // If this is the latest finalized block
  | 'past'      // If this block is finalized but not the latest
  | 'proposed'  // If this still has the chance to become finalized
  | 'orphaned'  // If alternative block at this height was finalized

export type BlockTags = [BlockStatus, 'view'] | [BlockStatus];

export function blockTagsStr(tags: BlockTags): string {
  if (tags[1]) {
    return `${tags[0]} ${tags[1]}`;
  } else {
    return tags[0];
  }
}