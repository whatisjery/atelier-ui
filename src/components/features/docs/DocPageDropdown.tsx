"use client"

import { Copy, Ellipsis, FileText } from "lucide-react"
import { useTranslations } from "next-intl"
import { DropdownMenu } from "radix-ui"
import { toast } from "sonner"
import Card from "@/components/ui/Card"
import DropdownButton from "@/components/ui/DropdownButton"
import { useCopy } from "@/hooks/use-copy"

const DROPDOWN_ACTIONS = [
    { key: "copy-page", icon: Copy, action: "copy" },
    { key: "view-as-markdown", icon: FileText, action: "view" },
] as const

type DocPageDropdownProps = {
    rawMarkdown: string
}

export default function DocPageDropdown({ rawMarkdown }: DocPageDropdownProps) {
    const tDropdown = useTranslations("docs.page-dropdown")
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
        <div className="flex items-center isolate max-lg:hidden">
            <DropdownMenu.Root modal={false}>
                <DropdownMenu.Trigger asChild>
                    <DropdownButton aria-label="Page menu" variant="primary">
                        <Ellipsis className="size-4" />
                    </DropdownButton>
                </DropdownMenu.Trigger>

                <DropdownMenu.Portal>
                    <DropdownMenu.Content
                        align="end"
                        sideOffset={4}
                        asChild
                        className="data-[state=open]:a-pop-in data-[state=closed]:a-pop-out z-10"
                    >
                        <Card className="min-w-70 p-2 ">
                            {DROPDOWN_ACTIONS.map(({ key, icon: Icon, action }) => (
                                <DropdownMenu.Item
                                    key={key}
                                    onClick={actionsMap[action]}
                                    className="flex items-center gap-2 rounded-xl p-2 text-sm cursor-pointer select-none hover:bg-accent-5 focus:bg-accent-5"
                                >
                                    <span className="border p-2 rounded-md bg-bg">
                                        <Icon className="size-4 text-accent-1" />
                                    </span>

                                    <div>
                                        <span className="font-medium">{tDropdown(key)}</span>
                                        <p className="text-accent-2 text-xs">
                                            {tDropdown(`${key}-description`)}
                                        </p>
                                    </div>
                                </DropdownMenu.Item>
                            ))}
                        </Card>
                    </DropdownMenu.Content>
                </DropdownMenu.Portal>
            </DropdownMenu.Root>
        </div>
    )
}
