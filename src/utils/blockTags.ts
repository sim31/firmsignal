import assert from 'firmcore/src/helpers/assert';
import { EFBlockPOD, NormalizedSlots } from "firmcore";

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

export type TaggedBlock = EFBlockPOD & {
  tags: BlockTags;
};

// Proposed (not yet finalized blocks) are at the end
export function tagBlocks(
  slots: NormalizedSlots<EFBlockPOD>
): { finalized: TaggedBlock[], proposed: TaggedBlock[] } {
  const finalized = slots.finalizedBlocks.map((block, index) => {
    let tags: BlockTags;
    const confirmStatus = block.state.confirmationStatus;
    if (block.height === 0) {
      assert(confirmStatus.final, "confirmation status in finalizedBlocks should be final");
      tags = ['genesis'];
    } else if (index < slots.finalizedBlocks.length - 1) {
      tags = ['past'];
    } else {
      // TODO: should probably set view elsewhere
      tags = ['consensus', 'view'];
    }
    return { ...block, tags };
  });

  const proposed: TaggedBlock[] = slots.proposed.map((block) => {
    return { ...block, tags: ['proposed'] }
  });

  return { finalized, proposed };
}
