import createMatcher from 'feather-route-matcher'
import ConfirmerHierarchy from '../components/ConfirmerHierarchy';
import CreateChain from '../components/CreateChain';
import NotFoundError from '../components/Errors/NotFoundError';
import FirmActions from '../components/FirmActions';
import FirmChain from '../components/FirmChain';
import FirmState from '../components/FirmState';
 
const rootRouteMatcher = createMatcher({
  '/newChain': CreateChain,
  '/chains/:chainId': FirmChain,
  '/chains/:chainId/:tab': FirmChain,
  '/': null,
  '/*': NotFoundError,
})

const chainRouteMatcher = createMatcher({
  '/chains/:chainId': FirmState,
  '/chains/:chainId/overview': FirmState,
  '/chains/:chainId/dir': NotFoundError,
  '/chains/:chainId/messages': FirmActions,
  '/chains/:chainId/confirmers': ConfirmerHierarchy,
  '*': NotFoundError,
});

export { rootRouteMatcher, chainRouteMatcher };