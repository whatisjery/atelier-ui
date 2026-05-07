"use client"

import { KeyRound, LoaderIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import CodeBlockClient from "@/components/features/docs/code-block/CodeBlockClient"
import Button from "@/components/ui/Button"
import { fetchProCode } from "@/lib/api"
import { SUPPORT_EMAIL } from "@/lib/constants"
import { getCodeThemeColors, themes } from "@/lib/shiki"
import { useGlobalStore } from "@/lib/store"
import { getErrorMessage } from "@/lib/utils"
import type { CodeBlock, CodeHast } from "@/types/code"

type ProCodeBlockProps = {
    name: string
} & Omit<CodeBlock, "code">

export default function ProCodeBlock({
    name,
    title,
    lang,
    mode,
    showLineNumbers,
}: ProCodeBlockProps) {
    const customer = useGlobalStore((s) => s.customer)
    const tCommon = useTranslations("common")
    const [shikiCode, setShikiCode] = useState<{ code: string; hast: CodeHast } | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [retryKey, setRetryKey] = useState(0)

    const licenseKey = customer?.licenseKey

    useEffect(() => {
        const key = licenseKey
        const controller = new AbortController()

        async function loadProCode() {
            setError(null)
            setShikiCode(null)

            try {
                const data = await fetchProCode(name, key, controller.signal)
                const code = data.files[0].content

                const { highlighter } = await getCodeThemeColors()

                const hast = highlighter.codeToHast(code, {
                    lang,
                    themes,
                    defaultColor: false,
                })
                if (controller.signal.aborted) return
                setShikiCode({ code, hast })
            } catch (err) {
                if (controller.signal.aborted) return
                setError(getErrorMessage(err))
                console.error("Failed to load pro code:", err)
            }
        }

        loadProCode()
        return () => controller.abort()
    }, [name, licenseKey, lang, retryKey])

    if (error)
        return (
            <div className="h-full w-full bg-accent-5 flex flex-col items-center justify-center not-prose ">
                <div className="flex flex-col items-center gap-y-2 mb-10">
                    <KeyRound strokeWidth={1.5} className="size-8" />
                    <p className="text-lg">{error}</p>
                    <Button variant="dashed" onClick={() => setRetryKey((k) => k + 1)}>
                        {tCommon("try-again")}
                    </Button>
                </div>

                <Button
                    asChild
                    variant="ghost"
                    className="gap-x-2 text-accent-2 w-full absolute bottom-2"
                >
                    <a href={`mailto:${SUPPORT_EMAIL}`}>{tCommon("support")}</a>
                </Button>
            </div>
        )

    if (!shikiCode)
        return (
            <div className="h-full w-full bg-accent-5 flex items-center justify-center gap-x-2">
                <LoaderIcon className="size-4 animate-spin" />
                <span className="animate-pulse font-mono uppercase">loading...</span>
            </div>
        )

    return (
        <CodeBlockClient
            mode={mode}
            title={title}
            code={shikiCode.code}
            hast={shikiCode.hast}
            lang={lang}
            showLineNumbers={showLineNumbers}
        />
    )
}
