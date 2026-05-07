import { getCodeThemeColors, themes } from "@/lib/shiki"
import type { CodeBlock } from "@/types/code"
import CodeBlockClient from "./CodeBlockClient"

type DocCodeBlockProps = CodeBlock

export default async function DocCodeBlock({
    code,
    lang,
    title = undefined,
    mode = "scroll",
    installTabs,
    showLineNumbers,
    className,
}: DocCodeBlockProps) {
    const { highlighter } = await getCodeThemeColors()

    const hast = highlighter.codeToHast(code, {
        lang,
        themes,
        defaultColor: false,
        colorReplacements: {
            // Replace the background color of the dark theme.
            "#24292e": "oklch(0.15 0.01 284.79)",
        },
    })

    return (
        <CodeBlockClient
            hast={hast}
            code={code}
            lang={lang}
            title={title}
            mode={mode}
            installTabs={installTabs}
            showLineNumbers={showLineNumbers}
            className={className}
        />
    )
}
