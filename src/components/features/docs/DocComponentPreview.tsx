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
                    <div className="flex flex-col">
                        <div className="w-full relative min-h-133 border overflow-hidden">
                            {Demo && <Demo />}
                        </div>
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
