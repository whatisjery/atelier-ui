import { getCodeThemeColors, themes } from "@/lib/shiki"
import type { CodeBlock } from "@/types/code"
import { DocCodeBlockClient } from "./DocCodeBlockClient"

type DocCodeBlockProps = CodeBlock

export async function DocCodeBlock({
    code,
    lang,
    title = undefined,
    mode = "scroll",
    installTabs,
    className,
}: DocCodeBlockProps) {
    const { highlighter } = await getCodeThemeColors()

    const hast = highlighter.codeToHast(code, {
        lang,
        themes,
        defaultColor: false,
        colorReplacements: {
            // Replace the background color of the dark theme.
            "#24292e": "oklch(0.21 0.01 285.87)",
        },
    })

    return (
        <DocCodeBlockClient
            hast={hast}
            code={code}
            lang={lang}
            title={title}
            mode={mode}
            installTabs={installTabs}
            className={className}
        />
    )
}
