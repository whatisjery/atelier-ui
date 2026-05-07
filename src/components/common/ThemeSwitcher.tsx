"use client"

import { type Theme, useGlobalStore } from "@/lib/store"
import { cn } from "@/lib/utils"

const THEME_VARIANT: Theme[] = [1, 2, 3] as const

type ThemeSwitcher = {
    className?: string
    size?: string
}

/*
 * Decorative gimmick, not meant to be accessible.
 */
export default function ThemeSwitcher({ size = "0.5rem", className }: ThemeSwitcher) {
    const setAppTheme = useGlobalStore((s) => s.setAppTheme)

    return (
        <span className={cn("flex items-center gap-x-1", className)}>
            {THEME_VARIANT.map((id) => (
                <span
                    key={id}
                    aria-hidden
                    onClick={() => setAppTheme(id)}
                    style={{ background: `var(--theme-${id}-bg)`, width: size, height: size }}
                    className="rounded-full cursor-pointer hover:scale-120 transition-transform duration-200 ease-expo-out"
                />
            ))}
        </span>
    )
}
