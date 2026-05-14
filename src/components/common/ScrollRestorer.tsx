"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"

export function ScrollRestorer() {
    const pathname = usePathname()

    useEffect(() => {
        if (!window.location.hash) {
            window.scrollTo(0, 0)
        }
    }, [pathname])

    return null
}
