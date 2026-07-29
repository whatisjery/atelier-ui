"use client"

import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { useCopy } from "@/hooks/use-copy"
import { formatControlProps } from "@/lib/control-props"
import { useControlValues } from "@/lib/control-store"
import { installPrompt } from "@/lib/install-prompt"
import { cn } from "@/lib/utils"
import type { ControlDef } from "@/types/controls"
import CodeBlockClient from "../code-block/CodeBlockClient"

type InstalGuidePromptProps = {
    name: string
    title: string
    controls?: Record<string, ControlDef>
}

export default function InstalGuidePrompt({
    name,
    title,
    controls = undefined,
}: InstalGuidePromptProps) {
    const tInstall = useTranslations("docs.install")
    const tCommon = useTranslations("common")

    const values = useControlValues(name)
    const props = controls ? formatControlProps(controls, values) : undefined
    const prompt = installPrompt(name, title, props)

    const { copied, copy } = useCopy({
        onSuccess: () =>
            toast.success(tCommon("copied"), {
                position: "top-center",
            }),
        resetAfterMs: 2000,
    })

    return (
        <>
            <CodeBlockClient title="Prompt" lang="text" icon="terminal" code={prompt} />

            {props && (
                <p>
                    {tInstall.rich("prompt-hint", {
                        copy: (chunks) => (
                            <button
                                type="button"
                                onClick={() => copy(prompt)}
                                className={cn(
                                    "group text-link px-0.5 font-medium inline-flex items-center gap-1 cursor-pointer",
                                    { "cursor-default pointer-events-none": copied },
                                )}
                                aria-label="Copy prompt"
                            >
                                <span className="group-hover:underline">{chunks}</span>
                            </button>
                        ),
                    })}
                </p>
            )}
        </>
    )
}
