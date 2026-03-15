import GridPattern from "@/components/ui/GridPattern"
import Tabs from "@/components/ui/Tabs"
import { demos } from "@/registry/demos"
import type { CodeFile } from "@/types/code"
import { DocCodeBlock } from "./DocCodeBlock"

type DocComponentPreviewProps = {
    name: string
    snippets: CodeFile
}

export default function DocComponentPreview({ name, snippets }: DocComponentPreviewProps) {
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
                    <div className="flex flex-col max-h-150 overflow-scroll">
                        <div className="w-full relative min-h-120 border overflow-hidden">
                            <GridPattern gridSize={20.5} />
                            {Demo && <Demo />}
                        </div>
                    </div>
                ),
                code: (
                    <div className="flex flex-col max-h-150 overflow-scroll rounded-sm">
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
