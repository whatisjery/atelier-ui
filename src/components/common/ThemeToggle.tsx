"use client"

import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import Button from "@/components/ui/Button"
import { cn } from "@/lib/utils"
import Tooltip from "../ui/Tooltip"

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    const t = useTranslations("docs.tooltips")

    useEffect(() => void setMounted(true), [])

    if (!mounted) return null

    const label = t("theme-toggle")

    const handleThemeToggle = () => {
        setTheme(theme === "light" ? "dark" : "light")
    }

    return (
        <Tooltip title={label}>
            <Button
                variant="ghost"
                size="icon"
                className="cursor-pointer"
                onClick={handleThemeToggle}
                aria-label={label}
                aria-pressed={theme === "dark"}
            >
                <div className="w-4 h-4 border-[1.5px] border-mat-1 rounded-full bg-mat-1 relative overflow-hidden">
                    <div
                        className={cn(
                            "absolute top-0 left-0 h-full w-full bg-background transition-transform duration-500 ease-expo-out translate-x-1/2",
                            { "-translate-x-1/2": theme === "light" },
                        )}
                    />
                </div>
            </Button>
        </Tooltip>
    )
}
