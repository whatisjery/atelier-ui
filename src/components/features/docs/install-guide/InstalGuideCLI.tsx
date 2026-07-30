import type { CodeBlockTabs } from "@/types/code"
import DocCodeBlock from "../code-block/CodeBlock"

type DocInstallGuideProps = {
    name: string
}

export const registryTabs: CodeBlockTabs[] = [
    { label: "npm", value: "npx shadcn@latest add" },
    { label: "yarn", value: "yarn dlx shadcn@latest add" },
    { label: "pnpm", value: "pnpm dlx shadcn@latest add" },
    { label: "bun", value: "bunx shadcn@latest add" },
]

export default function InstalGuideCLI({ name }: DocInstallGuideProps) {
    return <DocCodeBlock installTabs={registryTabs} code={`@atelier/${name}`} lang="bash" />
}
