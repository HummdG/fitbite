import { useCallback } from 'react';
import { router, type Href } from 'expo-router';

/**
 * A back handler that's safe at a stack root. `router.back()` dispatches GO_BACK
 * unconditionally — when the screen is the root of its navigator (Fast-Refresh
 * reload, deep link, or a screen AuthGate `replace`d to) there's nothing to pop and
 * the action is unhandled. This backs when there's history, otherwise replaces to a
 * sensible fallback. Evaluated at press time so it stays correct as history changes.
 */
export function useSafeBack(fallback: Href): () => void {
  return useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace(fallback);
  }, [fallback]);
}
