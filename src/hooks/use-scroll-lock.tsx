import { useLenis } from "lenis/react"
import { useLayoutEffect } from "react"

export function useScrollLock(active: boolean) {
    const lenis = useLenis()
    useLayoutEffect(() => {
        if (active) {
            lenis?.stop()
            document.body.style.overflow = "hidden"
        } else {
            lenis?.start()
            document.body.style.overflow = ""
        }

        return () => {
            lenis?.start()
            document.body.style.overflow = ""
        }
    }, [active, lenis])
}
