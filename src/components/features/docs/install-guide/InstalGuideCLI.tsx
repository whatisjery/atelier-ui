import { PACKAGE_NAME } from "@/lib/constants"
import type { CodeBlockTabs } from "@/types/code"
import DocCodeBlock from "../code-block/CodeBlock"

type DocInstallGuideProps = {
    name: string
}

const registryTabs: CodeBlockTabs[] = [
    { label: "npm", value: `npx ${PACKAGE_NAME} add` },
    { label: "yarn", value: `yarn dlx ${PACKAGE_NAME} add` },
    { label: "pnpm", value: `pnpm dlx ${PACKAGE_NAME} add` },
    { label: "bun", value: `bunx ${PACKAGE_NAME} add` },
]

export default function InstalGuideCLI({ name }: DocInstallGuideProps) {
    return <DocCodeBlock installTabs={registryTabs} code={name} lang="bash" />
}
