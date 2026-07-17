"use client"

import { Monitor, Moon, Sun } from "lucide-react"
import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import { useEffect, useId, useState } from "react"
import Button from "@/components/ui/Button"
import Skeleton from "@/components/ui/Skeleton"
import { cn } from "@/lib/utils"

const themeOptions = [
    { value: "light", icon: Sun },
    { value: "dark", icon: Moon },
    { value: "system", icon: Monitor },
] as const

type ThemeToggleProps = {
    side?: "top" | "bottom"
}

export default function ThemeToggle({ side = "bottom" }: ThemeToggleProps) {
    const { theme, resolvedTheme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    const [dismissed, setDismissed] = useState(false)
    const groupName = useId()
    const tTooltips = useTranslations("docs.tooltips")
    const tTheme = useTranslations("common.theme")

    useEffect(() => void setMounted(true), [])

    const label = tTooltips("theme-toggle")

    // has to match the size of the button
    if (!mounted) return <Skeleton className="size-9 rounded-lg" />

    return (
        <div className="relative group/theme" onMouseLeave={() => setDismissed(false)}>
            <Button variant="tertiary" size="icon" aria-label={label}>
                <div className="w-4 h-4 border-[1.5px] border-accent-1 rounded-full bg-accent-1 relative overflow-hidden">
                    <div
                        className={cn(
                            "absolute top-0 left-0 h-full w-full bg-bg transition-transform duration-500 ease-expo-out translate-x-1/2",
                            { "-translate-x-1/2": resolvedTheme === "light" },
                        )}
                    />
                </div>
            </Button>

            <div
                className={cn(
                    "absolute left-1/2 -translate-x-1/2 z-50 invisible opacity-0 transition-[opacity,visibility] duration-150",
                    "group-hover/theme:visible group-hover/theme:opacity-100",
                    "group-has-[:focus-visible]/theme:visible group-has-[:focus-visible]/theme:opacity-100",
                    dismissed && "!invisible !opacity-0",
                    side === "top" ? "bottom-full pb-1.5" : "top-full pt-1.5",
                )}
            >
                <fieldset className="flex flex-col gap-0.5 rounded-md border bg-bg p-1.5 min-w-35">
                    <legend className="sr-only">{label}</legend>

                    {themeOptions.map(({ value, icon: Icon }) => (
                        <label
                            key={value}
                            className={cn(
                                "flex cursor-pointer select-none items-center gap-2 rounded-sm px-2.5 py-1.5 text-xs whitespace-nowrap text-accent-1",
                                "hover:bg-accent-5 has-[:checked]:bg-accent-5 has-[:focus-visible]:bg-accent-5",
                            )}
                        >
                            <input
                                type="radio"
                                name={groupName}
                                value={value}
                                checked={theme === value}
                                onChange={(event) => {
                                    setTheme(value)
                                    setDismissed(true)
                                    event.currentTarget.blur()
                                }}
                                className="sr-only"
                            />
                            <Icon className="size-3.5" />
                            {tTheme(value)}
                        </label>
                    ))}
                </fieldset>
            </div>
        </div>
    )
}
