import { TaggedBlock } from "../utils/blockTags";

export interface ColoredText {
  text: string;
  color: string;
}

export function confirmationsText(block: TaggedBlock): ColoredText {
  const confirmStatus = block.state.confirmationStatus;
  if (block.tags[0] === 'past' || block.tags[0] === 'consensus') {
    return { 
      color: 'green',
      text: `${confirmStatus.currentWeight}/${confirmStatus.potentialWeight} (finalized)`
    };
  } else if (block.tags[0] === 'genesis') {
    return {
      color: 'black',
      text: `${confirmStatus.currentWeight}`
    };
  } else if (block.tags[0] === 'proposed') {
    return {
      color: 'orange',
      text: `${confirmStatus.currentWeight}/${confirmStatus.potentialWeight} (not finalized)`
    }
    // return ['orange', '(not finalized)'];
  } else {
    return {
      color: 'red',
      text: `${confirmStatus.currentWeight}/${confirmStatus.potentialWeight} (conflicts)`
    }
  }

}