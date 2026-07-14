"use client"

import { Monitor, Moon, Sun } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import Button from "@/components/ui/Button"
import Skeleton from "@/components/ui/Skeleton"
import { expoOut } from "@/lib/ease"
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
    const [open, setOpen] = useState(false)
    const tTooltips = useTranslations("docs.tooltips")
    const tTheme = useTranslations("common.theme")

    useEffect(() => void setMounted(true), [])

    const label = tTooltips("theme-toggle")

    // has to match the size of the button
    if (!mounted) return <Skeleton className="size-9 rounded-lg" />

    return (
        <div
            className="relative"
            onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false)
            }}
            onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        >
            <Button
                variant="tertiary"
                size="icon"
                onClick={() => setOpen((prev) => !prev)}
                aria-label={label}
                aria-haspopup="menu"
                aria-expanded={open}
            >
                <div className="w-4 h-4 border-[1.5px] border-accent-1 rounded-full bg-accent-1 relative overflow-hidden">
                    <div
                        className={cn(
                            "absolute top-0 left-0 h-full w-full bg-bg transition-transform duration-500 ease-expo-out translate-x-1/2",
                            { "-translate-x-1/2": resolvedTheme === "light" },
                        )}
                    />
                </div>
            </Button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        key="theme-menu"
                        initial={{ opacity: 0, y: side === "top" ? 6 : -6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: side === "top" ? 6 : -6, scale: 0.96 }}
                        transition={{ ease: expoOut, duration: 0.3 }}
                        className={cn("absolute left-1/2 z-50 -translate-x-1/2", {
                            "bottom-full pb-1.5": side === "top",
                            "top-full pt-1.5": side === "bottom",
                        })}
                        role="menu"
                        aria-label={label}
                    >
                        <div className="flex flex-col gap-0.5 rounded-md border bg-bg p-1.5 min-w-35">
                            {themeOptions.map(({ value, icon: Icon }) => (
                                <button
                                    key={value}
                                    type="button"
                                    role="menuitemradio"
                                    aria-checked={theme === value}
                                    onClick={() => {
                                        setTheme(value)
                                        setOpen(false)
                                    }}
                                    className={cn(
                                        "flex cursor-pointer items-center gap-2 rounded-sm px-2.5 py-1.5 text-xs whitespace-nowrap text-accent-1 outline-none",
                                        {
                                            "bg-accent-5": theme === value,
                                            "hover:bg-accent-5 focus-visible:bg-accent-5":
                                                theme !== value,
                                        },
                                    )}
                                >
                                    <Icon className="size-3.5" />
                                    {tTheme(value)}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
