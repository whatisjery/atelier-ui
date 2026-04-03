import GridPattern from "@/components/ui/GridPattern"
import Tabs from "@/components/ui/Tabs"
import { demos } from "@/registry/demos"
import type { CodeFile } from "@/types/code"
import { DocCodeBlock } from "./DocCodeBlock"
import Docr3fDemoLoader from "./Docr3fDemoLoader"

type DocComponentPreviewProps = {
    name: string
    snippets: CodeFile
    dreiLoader?: boolean
}

export default function DocComponentPreview({
    name,
    snippets,
    dreiLoader = false,
}: DocComponentPreviewProps) {
    const Demo = demos[name]

    return (
        <Tabs
            tabs={[
                { label: "Preview", value: "preview" },
                { label: "Code", value: "code" },
            ]}
            defaultValue="preview"
            contents={{
                preview: (
                    <div className="w-full relative min-h-133 border overflow-hidden">
                        <GridPattern
                            strokeColor="oklch(0.72 0 0 / 0.15)"
                            hoverEffect={false}
                            gridSize={28}
                        />
                        {dreiLoader && <Docr3fDemoLoader />}
                        {Demo && <Demo />}
                    </div>
                ),
                code: (
                    <div className="flex flex-col overflow-scroll rounded-sm">
                        <DocCodeBlock
                            title={snippets.path}
                            code={snippets.content}
                            lang={snippets.extension}
                        />
                    </div>
                ),
            }}
        />
    )
}
