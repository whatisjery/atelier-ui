import DocCodeBlock from "@/components/features/docs/code-block/CodeBlock"
import DemoPreview from "@/components/features/docs/demo-preview/DemoPreview"
import InstalGuideCLI from "@/components/features/docs/install-guide/InstalGuideCLI"
import InstalGuideManual from "@/components/features/docs/install-guide/InstalGuideManual"
import InstallTabs from "@/components/features/docs/install-guide/InstallTabs"
import { demoControls } from "@/registry/demos/controls"
import type { CodeFile } from "@/types/code"

/*
 * The MDX component map used by the docs page. Deployments that build on
 * top of this repository provide their own copy of this module, composing
 * this map and overriding or appending entries.
 */

export type DocMdxContext = {
    locale: string
    slug: string[]
    rawMarkdown: string
    frontmatter: Record<string, unknown>
    demoCode: Record<string, CodeFile[]>
    snippets: Record<string, CodeFile[]>
}

// biome-ignore lint/suspicious/noExplicitAny: MDX components receive untyped props
export type DocMdxComponents = Record<string, (props: any) => React.ReactNode>

export function buildDemoPreview(ctx: DocMdxContext): React.ReactNode {
    const { slug, demoCode } = ctx
    const name = slug[slug.length - 1]
    const files = demoCode[name]

    if (!files) return null

    return (
        <DemoPreview
            name={name}
            controls={demoControls[name]}
            codePreviewSlot={
                <DocCodeBlock
                    mode="preview"
                    showLineNumbers
                    title={files[0].path}
                    code={files[0].content}
                    lang={files[0].extension}
                />
            }
        />
    )
}

export function buildDocMdxComponents(ctx: DocMdxContext): DocMdxComponents {
    const { demoCode, snippets } = ctx

    return {
        SourceCode: (props: { name: string }) => (
            <DocCodeBlock
                mode="expand"
                showLineNumbers
                title={demoCode[props.name][0].path}
                code={demoCode[props.name][0].content}
                lang={demoCode[props.name][0].extension}
            />
        ),

        InstalGuideCLI: (props: { name: string }) => {
            return <InstalGuideCLI {...props} />
        },

        InstalGuideManual: (props: { name: string }) => {
            return <InstalGuideManual {...props} snippets={snippets[props.name]} />
        },

        InstallTabs: (props: { name: string; children?: React.ReactNode }) => {
            return (
                <InstallTabs
                    cliSlot={<InstalGuideCLI name={props.name} />}
                    manualSlot={
                        <InstalGuideManual name={props.name} snippets={snippets[props.name]} />
                    }
                    agentSlot={
                        props.children ? (
                            <div className="space-y-4">{props.children}</div>
                        ) : undefined
                    }
                />
            )
        },

        // Overridden by deployments that generate a component prompt.
        ComponentPrompt: () => null,
    }
}
