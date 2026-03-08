import { type BundledTheme, getSingletonHighlighter } from "shiki"

export const themes: Record<"light" | "dark", BundledTheme> = {
    light: "github-light",
    dark: "github-dark",
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
