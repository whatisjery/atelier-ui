import { type BundledTheme, getSingletonHighlighter, type HighlighterGeneric } from "shiki"
import type { CodeHast } from "@/types/code"

export const themes: Record<"light" | "dark", BundledTheme> = {
    light: "github-light",
    dark: "github-dark",
}

export function highlightToHast(
    highlighter: HighlighterGeneric<never, never>,
    code: string,
    lang: string,
): CodeHast {
    return highlighter.codeToHast(code, {
        lang,
        themes,
        defaultColor: false,
        colorReplacements: {
            // Replace the background color of the dark theme.
            "#24292e": "oklch(0.15 0.01 284.79)",
        },
    })
}

export async function getCodeThemeColors() {
    const highlighter = await getSingletonHighlighter({
        themes: Object.values(themes),
        langs: ["tsx", "ts", "css", "bash", "yaml"],
    })

    return {
        light: highlighter.getTheme(themes.light).bg,
        dark: highlighter.getTheme(themes.dark).bg,
        highlighter,
    }
}
