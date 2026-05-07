"use client"

import { useLayoutEffect } from "react"
import { useGlobalStore } from "@/lib/store"

export function ThemeSync() {
    const currentTheme = useGlobalStore((s) => s.theme)

    useLayoutEffect(() => {
        const root = document.documentElement
        if (!root) return
        root.style.setProperty("--theme-bg", `var(--theme-${currentTheme}-bg)`)
        root.style.setProperty("--theme-fg", `var(--theme-${currentTheme}-fg)`)
        root.style.setProperty("--theme-border", `var(--theme-${currentTheme}-border)`)
    }, [currentTheme])

    return null
}
