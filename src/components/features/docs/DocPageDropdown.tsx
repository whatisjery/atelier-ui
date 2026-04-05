"use client"

import { Copy, FileText } from "lucide-react"
import { useTranslations } from "next-intl"
import { DropdownMenu } from "radix-ui"
import { toast } from "sonner"
import Button from "@/components/ui/Button"
import { useCopy } from "@/hooks/use-copy"

const DROPDOWN_ACTIONS = [
    { key: "copy-page", icon: Copy, action: "copy" },
    { key: "view-as-markdown", icon: FileText, action: "view" },
] as const

type DocPageDropdownProps = {
    rawMarkdown: string
}

export default function DocPageDropdown({ rawMarkdown }: DocPageDropdownProps) {
    const t = useTranslations("docs.page-dropdown")
    const tCommon = useTranslations("common")

    const { copy } = useCopy({
        onSuccess: () =>
            toast.success(tCommon("copied"), {
                position: "top-center",
            }),
        resetAfterMs: 2000,
    })

    const actionsMap = {
        copy: () => copy(rawMarkdown),
        view: () => {
            const blob = new Blob([rawMarkdown], { type: "text/plain" })
            const url = URL.createObjectURL(blob)
            window.open(url, "_blank")
        },
    }

    return (
        <div className="flex items-center isolate">
            <DropdownMenu.Root modal={false}>
                <DropdownMenu.Trigger asChild>
                    <Button size="icon" variant="outline">
                        <Copy className="size-4" />
                    </Button>
                </DropdownMenu.Trigger>

                <DropdownMenu.Portal>
                    <DropdownMenu.Content
                        align="end"
                        sideOffset={4}
                        className="min-w-70 rounded-xl border bg-background p-1 animate-in fade-in-0  slide-in-from-top-2"
                    >
                        {DROPDOWN_ACTIONS.map(({ key, icon: Icon, action }) => (
                            <DropdownMenu.Item
                                key={key}
                                onClick={actionsMap[action]}
                                className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm cursor-pointer  select-none hover:bg-mat-5 focus:bg-mat-5"
                            >
                                <span className="border p-2 rounded-md bg-background border-mat-3/80">
                                    <Icon className="size-4 text-mat-1" />
                                </span>
                                <div>
                                    <span className="font-medium">{t(key)}</span>
                                    <p className="text-mat-2 text-xs">{t(`${key}-description`)}</p>
                                </div>
                            </DropdownMenu.Item>
                        ))}
                    </DropdownMenu.Content>
                </DropdownMenu.Portal>
            </DropdownMenu.Root>
        </div>
    )
}
