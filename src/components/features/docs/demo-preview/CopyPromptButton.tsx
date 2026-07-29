"use client"

import { Lock } from "lucide-react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import Button from "@/components/ui/Button"
import { useCopy } from "@/hooks/use-copy"
import { formatControlProps } from "@/lib/control-props"
import { useControlValues } from "@/lib/control-store"
import { installPrompt } from "@/lib/install-prompt"
import { cn } from "@/lib/utils"
import type { ControlDef } from "@/types/controls"

type CopyPromptButtonProps = {
    name: string
    title: string
    controls?: Record<string, ControlDef> | undefined
    lockedHref?: string | undefined
    className?: string
}

export default function CopyPromptButton({
    name,
    title,
    controls = undefined,
    lockedHref = undefined,
    className = undefined,
}: CopyPromptButtonProps) {
    const tDemo = useTranslations("docs.demo-preview")
    const tCommon = useTranslations("common")

    const values = useControlValues(name)
    const props = controls ? formatControlProps(controls, values) : undefined

    const { copy } = useCopy({
        onSuccess: () =>
            toast.success(tCommon("copied"), {
                position: "top-center",
            }),
        resetAfterMs: 2000,
    })

    const buttonClassName = cn("px-4 h-full gap-x-1.5 whitespace-nowrap text-xs", className)

    if (lockedHref) {
        return (
            <Button variant="secondary" asChild className={buttonClassName}>
                <a
                    href={lockedHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="no-underline"
                    aria-label={tDemo("unlock-code")}
                >
                    {tDemo("copy-prompt")}

                    <Lock strokeWidth={1.5} className="size-3" />
                </a>
            </Button>
        )
    }

    return (
        <Button
            variant="secondary"
            onClick={() => copy(installPrompt(name, title, props))}
            className={cn(buttonClassName, "w-25")}
        >
            {tDemo("copy-prompt")}
        </Button>
    )
}
