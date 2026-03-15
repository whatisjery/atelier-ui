export type CodeBlockMode = "expand" | "scroll"

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
    className?: string
}

export type CodeFile = {
    content: string
    filename: string
    extension: string
    path: string
}
