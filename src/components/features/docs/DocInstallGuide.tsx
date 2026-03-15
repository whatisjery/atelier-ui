import Tabs from "@/components/ui/Tabs"
import { PACKAGE_NAME } from "@/lib/constants"
import { components } from "@/registry"
import type { CodeBlockTabs, CodeFile } from "@/types/code"
import { DocCodeBlock } from "./DocCodeBlock"
import DocStep from "./DocStep"

type DocInstallGuideProps = {
    name: string
    snippets: CodeFile[]
}

const registryTabs: CodeBlockTabs[] = [
    { label: "npm", value: `npx ${PACKAGE_NAME} add` },
    { label: "yarn", value: `yarn dlx ${PACKAGE_NAME} add` },
    { label: "pnpm", value: `pnpm dlx ${PACKAGE_NAME} add` },
] as const

const manualInstallTabs: CodeBlockTabs[] = [
    { label: "npm", value: "npm install" },
    { label: "yarn", value: "yarn add" },
    { label: "pnpm", value: "pnpm add" },
    { label: "bun", value: "bun add" },
] as const

const tabs = [
    { label: "CLI", value: "cli" },
    { label: "Manual", value: "manual" },
]

export default function DocInstallGuide({ name, snippets }: DocInstallGuideProps) {
    const component = components.find((item) => item.name === name)
    const deps = component?.dependencies ?? []

    const manualSteps = [
        ...(deps.length > 0
            ? [
                  {
                      title: "Install dependencies",
                      content: (
                          <DocCodeBlock
                              installTabs={manualInstallTabs}
                              code={deps.join(" ")}
                              lang="bash"
                              className="mt-5"
                          />
                      ),
                  },
              ]
            : []),
        {
            title: "Copy and paste",
            content: (
                <>
                    <p aria-hidden="true">
                        Copy the code and paste it in your project and start using the component.
                    </p>
                    {snippets.map((snippet) => (
                        <DocCodeBlock
                            mode="expand"
                            key={snippet.path}
                            title={snippet.path}
                            code={snippet.content}
                            lang={snippet.extension}
                        />
                    ))}
                </>
            ),
        },
    ]

    return (
        <Tabs
            tabs={tabs}
            defaultValue="cli"
            contents={{
                cli: <DocCodeBlock installTabs={registryTabs} code={name} lang="bash" />,
                manual: (
                    <>
                        {manualSteps.map((step, index) => (
                            <DocStep key={step.title} title={step.title} step={index + 1}>
                                {step.content}
                            </DocStep>
                        ))}
                    </>
                ),
            }}
        />
    )
}
