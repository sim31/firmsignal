import { Address, BlockId } from 'firmcore';
import { TaggedBlock } from '../utils/blockTags.js';

// block number -> confirmed block;
export type UserConfirmationMap = Record<number, BlockId[]>;

export function getUserConfirmMap(
  account: Address,
  finalized: TaggedBlock[], proposed: TaggedBlock[]
): UserConfirmationMap {
  const map: UserConfirmationMap = {};
  for (const bl of finalized.concat(proposed)) {
    const conf = bl.state.confirmations.find(c => c === account);
    if (conf !== undefined) {
      const exArr = map[bl.height];
      const arr = exArr !== undefined ? exArr : [];
      arr.push(bl.id);
      map[bl.height] = arr;
    }
  }
  return map;
}
