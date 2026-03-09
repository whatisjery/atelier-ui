"use client"

import { useIsomorphicLayoutEffect } from "motion/react"
import { usePathname } from "next/navigation"

export function ScrollRestorer() {
    const pathname = usePathname()

    useIsomorphicLayoutEffect(() => {
        window.scrollTo(0, 0)
    }, [pathname])

    return null
}
