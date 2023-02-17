import createMatcher from 'feather-route-matcher'
import CreateChain from '../components/CreateChain';
import NotFoundError from '../components/Errors/NotFoundError';
import FirmChain from '../components/FirmChain';
 
const rootRouteMatcher = createMatcher({
  '/newChain': CreateChain,
  '/chains/:chainId': FirmChain,
  '/': null,
  '/*': NotFoundError,
})

export { rootRouteMatcher };