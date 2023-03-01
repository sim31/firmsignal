import { useRouteMatcher } from "../global/hooks";

export function getRouteParam<T>(routeMatch: ReturnType<typeof useRouteMatcher<T>>, paramId: string): string | undefined;
export function getRouteParam<T>(routeMatch: ReturnType<typeof useRouteMatcher<T>>, paramId: string, defaultVal: string): string;
export function getRouteParam<T>(routeMatch: ReturnType<typeof useRouteMatcher<T>>, paramId: string, defaultVal?: string): string | undefined {
  if (routeMatch.params && routeMatch.params[paramId]) {
    return routeMatch.params[paramId];
  } else {
    return defaultVal;
  }
}
