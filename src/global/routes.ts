import * as createMatcher from 'feather-route-matcher'
import CreateChain from '../components/CreateChain.js'
import NotFoundError from '../components/Errors/NotFoundError.js'
import FirmChain from '../components/FirmChain.js'
import FirmState from '../components/FirmState.js'
import FirmBlocks from '../components/FirmBlocks.js'
import CreateBlock from '../components/CreateBlock.js'
// const createMatcher = routeMatcherPkg.default;

const rootRouteMatcher = createMatcher.default({
  '/newChain': CreateChain,
  '/chains/:chainId': FirmChain,
  '/chains/:chainId/:tab': FirmChain,
  '/chains/:chainId/:tab/*': FirmChain,
  '/': null,
  '/*': NotFoundError
})

const chainRouteMatcher = createMatcher.default({
  '/chains/:chainId': FirmState,
  '/chains/:chainId/overview': FirmState,
  '/chains/:chainId/dir': NotFoundError,
  '/chains/:chainId/blocks': FirmBlocks,
  '/chains/:chainId/blocks/:block': FirmBlocks,
  '/chains/:chainId/newBlock': CreateBlock,
  '*': NotFoundError
})

export { rootRouteMatcher, chainRouteMatcher }
