import { type TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import {
  selectLocation
} from '../global/slices/appLocation.js'
import type { RootState, AppDispatch } from './store.js'
import routeMatcher from 'feather-route-matcher'
import { chainRouteMatcher } from './routes.js'
import { type Chain, selectChain, isShallowChain, isFullChain } from './slices/chains.js'
import { getRouteParam } from '../helpers/routes.js'
import { useCallback } from 'react'
import copy from 'copy-to-clipboard'
import { setTimedAlert } from './slices/status.js'
import { type TaggedBlock, tagBlocks } from '../utils/blockTags.js'
import assert from 'firmcore/src/helpers/assert.js'

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export const useRouteMatcher = <T>(matcher: ReturnType<typeof routeMatcher.default<T>>) => {
  const path = useAppSelector(selectLocation).pathname
  return matcher(path)
}

export function useCurrentChainRoute () {
  const routeMatch = useRouteMatcher(chainRouteMatcher)
  const address = getRouteParam(routeMatch, 'chainId', '')
  const chain: Chain | undefined =
    useAppSelector(state => selectChain(state, address))
  return { chain, routeMatch }
}

// TODO: use maxBlocks argument
export function useLatestBlocks (maxBlocks: number = 6) {
  const { chain, routeMatch } = useCurrentChainRoute()
  if (chain === undefined || !isFullChain(chain)) {
    return {
      chain,
      routeMatch,
      finalized: new Array<TaggedBlock>(),
      proposed: new Array<TaggedBlock>(),
      headBlock: undefined
    }
  }

  const { finalized, proposed } = tagBlocks(chain.slots)

  const headBlock = finalized[finalized.length - 1]
  assert(
    (headBlock == null) || headBlock.tags[0] === 'consensus' || headBlock.tags[0] === 'genesis',
    'Tag of the head block has to be consensus or genesis'
  )

  return { chain, routeMatch, finalized, proposed, headBlock }
}

export function useCopyCallback (dispatch: ReturnType<typeof useAppDispatch>, value: any) {
  return useCallback(() => {
    copy(value.toString())
    dispatch(setTimedAlert({ status: 'info', msg: 'Copied to clipboard' }, 3000))
  }, [dispatch, value])
}
