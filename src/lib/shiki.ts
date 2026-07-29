import { type BundledTheme, getSingletonHighlighter, type HighlighterGeneric } from "shiki"

export const themes: Record<"light" | "dark", BundledTheme> = {
    light: "github-light",
    dark: "github-dark",
}

const darkBackground = "oklch(0.15 0.01 284.79)"

export function highlightToHtml(
    highlighter: HighlighterGeneric<never, never>,
    code: string,
    lang: string,
): string {
    return highlighter.codeToHtml(code, {
        lang,
        themes,
        defaultColor: false,
        colorReplacements: { "#24292e": darkBackground },
        transformers: [
            {
                root(node) {
                    const pre = node.children[0]
                    if (pre?.type !== "element") return
                    const codeElement = pre.children[0]
                    if (codeElement?.type !== "element") return
                    node.children = codeElement.children
                },
            },
        ],
    })
}

export async function getCodeThemeColors() {
    const highlighter = await getSingletonHighlighter({
        themes: Object.values(themes),
        langs: ["tsx", "ts", "css", "bash", "yaml", "markdown", "json"],
    })

    return {
        light: highlighter.getTheme(themes.light).bg,
        dark: darkBackground,
        highlighter,
    }
}
