import { type useRouteMatcher } from '../global/hooks.js'

export function getRouteParam<T> (routeMatch: ReturnType<typeof useRouteMatcher<T>>, paramId: string): string | undefined
export function getRouteParam<T> (routeMatch: ReturnType<typeof useRouteMatcher<T>>, paramId: string, defaultVal: string): string
export function getRouteParam<T> (routeMatch: ReturnType<typeof useRouteMatcher<T>>, paramId: string, defaultVal?: string): string | undefined {
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  if ((routeMatch.params !== null) && routeMatch.params[paramId] !== undefined) {
    return routeMatch.params[paramId]
  } else {
    return defaultVal
  }
}
