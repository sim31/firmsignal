import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import {
  selectLocation
} from '../global/slices/appLocation';
import type { RootState, AppDispatch } from './store';
import createMatcher from 'feather-route-matcher'
import { chainRouteMatcher } from './routes';
import { selectChain } from './slices/chains';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useRouteMatcher = <T>(matcher: ReturnType<typeof createMatcher<T>>) => {
  const path = useAppSelector(selectLocation).pathname 
  return matcher(path);
}
// export const useCurrentChainRoute = () => {
//   useRouteMatcher(chainRouteMatcher);
//   const routeMatch = useRouteMatcher(chainRouteMatcher);
//   const address = routeMatch.params ? routeMatch.params['chainId'] : '';
//   return [useAppSelector(state => selectChain(state, address)), routeMatch];
// }
