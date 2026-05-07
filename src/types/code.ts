import type { codeToHast } from "shiki"

export type CodeHast = Awaited<ReturnType<typeof codeToHast>>

export type CodeBlockMode = "expand" | "scroll" | "preview"

export type CodeBlockTabs = {
    label: string
    value: string
}

export type CodeBlock = {
    code: string
    lang: string
    title?: string
    installTabs?: CodeBlockTabs[]
    mode?: CodeBlockMode
    showLineNumbers?: boolean
    className?: string
}

export type CodeFile = {
    content: string
    filename: string
    extension: string
    path: string
}
