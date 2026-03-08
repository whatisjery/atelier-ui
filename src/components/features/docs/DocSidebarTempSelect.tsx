"use client"

import { ChevronDown } from "lucide-react"
import { useTranslations } from "next-intl"
import { Select } from "radix-ui"
import Badge from "@/components/ui/Badge"
import { useRouter } from "@/i18n/navigation"
import { TEMP_NAV_LINKS } from "@/lib/constants"
import { cn } from "@/lib/utils"

/**
 * A temporary select menu for the sidebar for upcoming features.
 */
export default function DocSidebarTempSelect() {
    const t = useTranslations("docs.links")
    const tCommon = useTranslations("common")
    const router = useRouter()

    const handleValueChange = (key: string) => {
        const link = TEMP_NAV_LINKS.find((l) => l.key === key)
        if (link && !link.wip) router.push(link.href)
    }

    return (
        <Select.Root defaultValue={TEMP_NAV_LINKS[0].key} onValueChange={handleValueChange}>
            <Select.Trigger className="flex hover:border-mat-3 cursor-pointer items-center justify-between w-full rounded-md border px-3 py-2 text-sm bg-transparent">
                <Select.Value />
                <Select.Icon>
                    <ChevronDown className="size-4 text-mat-2" />
                </Select.Icon>
            </Select.Trigger>

            <Select.Portal>
                <Select.Content
                    className="z-[99] min-w-[var(--radix-select-trigger-width)] rounded-md border bg-background p-1 animate-in fade-in-0 zoom-in-95"
                    position="popper"
                    sideOffset={4}
                    align="start"
                >
                    <Select.Viewport className="w-full">
                        {TEMP_NAV_LINKS.map(({ key, wip }) => (
                            <Select.Item
                                key={key}
                                value={key}
                                disabled={wip}
                                className={cn(
                                    "flex items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none cursor-pointer focus:bg-mat-5",
                                    { "pointer-events-none opacity-50": wip },
                                )}
                            >
                                <Select.ItemText>
                                    <span className="flex items-center justify-between w-full">
                                        {t(key)}
                                        {wip && (
                                            <Badge
                                                title={tCommon("wip")}
                                                className="ml-3"
                                                variant="wip"
                                            />
                                        )}
                                    </span>
                                </Select.ItemText>
                            </Select.Item>
                        ))}
                    </Select.Viewport>
                </Select.Content>
            </Select.Portal>
        </Select.Root>
    )
}
