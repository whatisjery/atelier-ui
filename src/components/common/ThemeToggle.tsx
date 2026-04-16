"use client"

import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import Button from "@/components/ui/Button"
import Skeleton from "@/components/ui/Skeleton"
import { cn } from "@/lib/utils"
import Tooltip from "../ui/Tooltip"

export default function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    const t = useTranslations("docs.tooltips")

    useEffect(() => void setMounted(true), [])

    const label = t("theme-toggle")

    if (!mounted) return <Skeleton className="size-9 rounded-lg" />


    const handleThemeToggle = () => {
        setTheme(resolvedTheme === "light" ? "dark" : "light")
    }

    return (
        <Tooltip title={label}>
            <Button
                variant="ghost-solid"
                size="icon"
                className="cursor-pointer"
                onClick={handleThemeToggle}
                aria-label={label}
                aria-pressed={resolvedTheme === "dark"}
            >
                <div className="w-4 h-4 border-[1.5px] border-mat-1 rounded-full bg-mat-1 relative overflow-hidden">
                    <div
                        className={cn(
                            "absolute top-0 left-0 h-full w-full bg-background transition-transform duration-500 ease-expo-out translate-x-1/2",
                            { "-translate-x-1/2": resolvedTheme === "light" },
                        )}
                    />
                </div>
            </Button>
        </Tooltip>
    )
}
