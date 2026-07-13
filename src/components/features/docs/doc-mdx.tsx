import DocCodeBlock from "@/components/features/docs/code-block/CodeBlock"
import DemoPreview from "@/components/features/docs/demo-preview/DemoPreview"
import InstalGuideCLI from "@/components/features/docs/install-guide/InstalGuideCLI"
import InstalGuideManual from "@/components/features/docs/install-guide/InstalGuideManual"
import InstallTabs from "@/components/features/docs/install-guide/InstallTabs"
import type { CodeFile } from "@/types/code"
import type { ControlDef } from "@/types/controls"

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

export type DemoPreviewMdxProps = {
    name: string
    controls?: Record<string, ControlDef>
    studio?: string
}

// biome-ignore lint/suspicious/noExplicitAny: MDX components receive untyped props
export type DocMdxComponents = Record<string, (props: any) => React.ReactNode>

export function buildDocMdxComponents(ctx: DocMdxContext): DocMdxComponents {
    const { demoCode, snippets } = ctx

    return {
        DemoPreview: (props: DemoPreviewMdxProps) => (
            <DemoPreview
                name={props.name}
                controls={props.controls}
                codePreviewSlot={
                    <DocCodeBlock
                        mode="preview"
                        showLineNumbers
                        title={demoCode[props.name][0].path}
                        code={demoCode[props.name][0].content}
                        lang={demoCode[props.name][0].extension}
                    />
                }
            />
        ),

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

        InstallTabs: (props: { name: string }) => {
            return (
                <InstallTabs
                    cliSlot={<InstalGuideCLI name={props.name} />}
                    manualSlot={
                        <InstalGuideManual name={props.name} snippets={snippets[props.name]} />
                    }
                />
            )
        },
    }
}
