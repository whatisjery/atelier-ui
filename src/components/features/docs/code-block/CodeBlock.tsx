import { getCodeThemeColors, highlightToHast } from "@/lib/shiki"
import type { CodeBlock } from "@/types/code"
import CodeBlockClient from "./CodeBlockClient"

type DocCodeBlockProps = CodeBlock

export default async function DocCodeBlock({
    code,
    lang,
    icon = undefined,
    title = undefined,
    mode = "scroll",
    installTabs,
    showLineNumbers,
    className,
}: DocCodeBlockProps) {
    const { highlighter } = await getCodeThemeColors()

    const hast = highlightToHast(highlighter, code, lang)

    return (
        <CodeBlockClient
            hast={hast}
            code={code}
            lang={lang}
            icon={icon}
            title={title}
            mode={mode}
            installTabs={installTabs}
            showLineNumbers={showLineNumbers}
            className={className}
        />
    )
}
