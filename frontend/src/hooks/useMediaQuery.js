import { useCallback, useSyncExternalStore } from "react";

// Re-renders when a CSS media query starts or stops matching, e.g. when the
// system switches between light and dark mode.
export function useMediaQuery(query) {
  const subscribe = useCallback(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches);
}
