"use client"

import { Monitor, Moon, Sun } from "lucide-react"
import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import { DropdownMenu } from "radix-ui"
import { useEffect, useState } from "react"
import Button from "@/components/ui/Button"
import Skeleton from "@/components/ui/Skeleton"
import { useDropdownFocus } from "@/hooks/use-dropdown-focus"
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
    const focus = useDropdownFocus()
    const tTooltips = useTranslations("docs.tooltips")
    const tTheme = useTranslations("common.theme")

    useEffect(() => void setMounted(true), [])

    const label = tTooltips("theme-toggle")

    // has to match the size of the button
    if (!mounted) return <Skeleton className="size-9 rounded-lg" />

    return (
        <DropdownMenu.Root modal={false}>
            <DropdownMenu.Trigger asChild>
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
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
                <DropdownMenu.Content
                    {...focus}
                    side={side}
                    sideOffset={6}
                    className="data-[state=open]:a-pop-in data-[state=closed]:a-pop-out z-50"
                >
                    <DropdownMenu.RadioGroup
                        value={theme}
                        onValueChange={setTheme}
                        className="flex flex-col gap-0.5 rounded-md border bg-bg p-1.5 min-w-35"
                    >
                        {themeOptions.map(({ value, icon: Icon }) => (
                            <DropdownMenu.RadioItem
                                key={value}
                                value={value}
                                className={cn(
                                    "flex cursor-pointer items-center gap-2 rounded-sm px-2.5 py-1.5 text-xs whitespace-nowrap text-accent-1 outline-none",
                                    {
                                        "bg-accent-5": theme === value,
                                        "hover:bg-accent-5 data-[highlighted]:bg-accent-5":
                                            theme !== value,
                                    },
                                )}
                            >
                                <Icon className="size-3.5" />
                                {tTheme(value)}
                            </DropdownMenu.RadioItem>
                        ))}
                    </DropdownMenu.RadioGroup>
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    )
}
