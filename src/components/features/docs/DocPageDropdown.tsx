"use client"

import { Copy, Ellipsis, FileText } from "lucide-react"
import { useTranslations } from "next-intl"
import { DropdownMenu } from "radix-ui"
import { RiOpenaiFill } from "react-icons/ri"
import { SiClaude, SiPerplexity } from "react-icons/si"
import { toast } from "sonner"
import Card from "@/components/ui/Card"
import DropdownButton from "@/components/ui/DropdownButton"
import { useCopy } from "@/hooks/use-copy"

/*
 * Each assistant takes the prompt as a query parameter on a new conversation.
 * The page is passed as a URL rather than as its markdown so the prompt stays
 * short enough to survive the length limits browsers put on a URL.
 */
const ASSISTANTS = {
    chatgpt: "https://chatgpt.com/?q=",
    claude: "https://claude.ai/new?q=",
    perplexity: "https://www.perplexity.ai/search?q=",
} as const

const DROPDOWN_ACTIONS = [
    { key: "copy-page", icon: Copy, action: "copy" },
    { key: "view-as-markdown", icon: FileText, action: "view" },
    { key: "open-in-chatgpt", icon: RiOpenaiFill, action: "chatgpt" },
    { key: "open-in-claude", icon: SiClaude, action: "claude" },
    { key: "open-in-perplexity", icon: SiPerplexity, action: "perplexity" },
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

    const askAbout = (assistant: keyof typeof ASSISTANTS) => () => {
        const prompt = tDropdown("ask-prompt", { url: window.location.href })
        window.open(
            `${ASSISTANTS[assistant]}${encodeURIComponent(prompt)}`,
            "_blank",
            "noopener,noreferrer",
        )
    }

    const actionsMap = {
        copy: () => copy(rawMarkdown),
        view: () => {
            const blob = new Blob([rawMarkdown], { type: "text/plain" })
            const url = URL.createObjectURL(blob)
            window.open(url, "_blank")
        },
        chatgpt: askAbout("chatgpt"),
        claude: askAbout("claude"),
        perplexity: askAbout("perplexity"),
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
