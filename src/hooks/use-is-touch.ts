import { useSyncExternalStore } from "react"

export function useIsTouch() {
    return useSyncExternalStore(
        (cb) => {
            const mediaQuery = window.matchMedia("(pointer: coarse)")
            mediaQuery.addEventListener("change", cb)
            return () => mediaQuery.removeEventListener("change", cb)
        },
        () => window.matchMedia("(pointer: coarse)").matches,
        () => false,
    )
}
