import { createHighlighter, type Highlighter } from "shiki"
import { createJavaScriptRegexEngine } from "shiki/engine/javascript"
import { themes } from "./shiki"

let highlighterPromise: Promise<Highlighter> | null = null

export function getClientHighlighter(): Promise<Highlighter> {
    if (!highlighterPromise) {
        highlighterPromise = createHighlighter({
            themes: Object.values(themes),
            langs: ["tsx"],
            engine: createJavaScriptRegexEngine(),
        })
    }
    return highlighterPromise
}
