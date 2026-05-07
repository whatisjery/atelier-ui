import { components } from "@/registry"
import type { CodeBlockTabs, CodeFile } from "@/types/code"
import DocCodeBlock from "../code-block/CodeBlock"

type DocInstallGuideProps = {
    name: string
    snippets: CodeFile[]
}

const manualInstallTabs: CodeBlockTabs[] = [
    { label: "npm", value: "npm install" },
    { label: "yarn", value: "yarn add" },
    { label: "pnpm", value: "pnpm add" },
    { label: "bun", value: "bun add" },
]

export default function InstalGuideManual({ name, snippets }: DocInstallGuideProps) {
    const component = components.find((item) => item.name === name)
    const deps = component?.dependencies ?? []

    return (
        <>
            <DocCodeBlock
                installTabs={manualInstallTabs}
                code={deps.join(" ")}
                lang="bash"
                className="mt-5"
            />

            {snippets.map((snippet) => (
                <DocCodeBlock
                    showLineNumbers
                    mode="expand"
                    key={snippet.path}
                    title={snippet.path}
                    code={snippet.content}
                    lang={snippet.extension}
                />
            ))}
        </>
    )
}
