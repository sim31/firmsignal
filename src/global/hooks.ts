import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import {
  selectLocation
} from '../global/slices/appLocation';
import type { RootState, AppDispatch } from './store';
import createMatcher from 'feather-route-matcher'
import { chainRouteMatcher } from './routes';
import { selectChain, selectSlice } from './slices/chains';
import { getRouteParam } from '../helpers/routes';
import { BlockTags, Chain } from './types';
import { useCallback, useMemo } from 'react';
import { OptExtendedBlockValue } from 'firmcontracts/interface/types';
import { blocksWithConfirmInfo } from 'firmcontracts/interface/firmchain';
import copy from 'copy-to-clipboard';
import { setTimedAlert } from './slices/status';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useRouteMatcher = <T>(matcher: ReturnType<typeof createMatcher<T>>) => {
  const path = useAppSelector(selectLocation).pathname 
  return matcher(path);
}

export function useCurrentChainRoute() {
  const routeMatch = useRouteMatcher(chainRouteMatcher);
  const address = getRouteParam(routeMatch, 'chainId', '');
  const chain: Chain | undefined = useAppSelector(state => selectChain(state, address));
  return { chain, routeMatch };
}


export function useLatestBlocks(maxBlocks: number = 6) {
  const { chain, routeMatch } = useCurrentChainRoute();
  // TODO: Move into 3 hook calls below into a hook and use in "Messages" as well
  const latestBls = useAppSelector(
    state => chain && selectSlice(state, chain.address, -maxBlocks));

  const filledBlocks = useMemo(() => {
    if (latestBls) {
      const bls = new Array<OptExtendedBlockValue>();
      if (latestBls[0]?.state.blockNum === 0) {
        bls.push(latestBls[0]);
      }
      bls.push(...blocksWithConfirmInfo(latestBls))
      bls.reverse();

      return bls;
    } else {
      return undefined;
    }
  }, [latestBls]);

  const blockTags: BlockTags[] | undefined = useMemo(() => {
    const tags = filledBlocks?.map<BlockTags>(bl => ['proposed']);
    if (tags && filledBlocks) {
      let headIndex: number | undefined;
      for (const [index, bl] of filledBlocks.entries()) {
        if (bl.state.blockNum === 0) {
          tags[index] = ['genesis'];
        } else if (bl.state.confirmCount && bl.state.thresholdThis) {
          if (bl.state.confirmCount >= bl.state.thresholdThis) {
            if (!headIndex) {
              headIndex = index;
              tags[index] = ['consensus'];
            } else {
              const headBlockNum = filledBlocks[headIndex]?.state.blockNum;
              if (headBlockNum && headBlockNum > bl.state.blockNum) {
                tags[index] = ['past'];
              } else if (headBlockNum) {
                tags[headIndex] = tags[index] = ['byzantine'];
              } else {
                // Should never happen
                throw new Error('Invalid index set');
              }
            }
          } else {
            if (headIndex) {
              tags[index] = ['orphaned'];
            } else {
              tags[index] = ['proposed'];
            }
          }
        }
      }
    }
    return tags;
  }, [filledBlocks])

  const headBlock = filledBlocks && filledBlocks[0];
  const state = headBlock?.state;

  return {filledBlocks, blockTags, chain, routeMatch, headBlock, state };
}

export function useCopyCallback(dispatch: ReturnType<typeof useAppDispatch>, value: any) {
  return useCallback(() => {
    if (value) {
      copy(value.toString());
      dispatch(setTimedAlert({ status: 'info', msg: 'Copied to clipboard' }, 3000));
    }
  }, [value])
}
