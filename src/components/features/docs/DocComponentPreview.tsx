"use client"

import { useState } from "react"
import GridPattern from "@/components/ui/GridPattern"
import Tabs from "@/components/ui/Tabs"
import { demos } from "@/registry/demos"
import type { CodeFile } from "@/types/code"
import type { ControlDef, ControlValue } from "@/types/controls"
import ControlsPanel from "./controls/ControlPanel"
import Docr3fDemoLoader from "./Docr3fDemoLoader"

type DocComponentPreviewProps = {
    name: string
    snippets: CodeFile
    dreiLoader?: boolean
    controls?: Record<string, ControlDef> | undefined
    codePreviewSlot: React.ReactNode
}

export default function DocComponentPreview({
    name,
    codePreviewSlot,
    dreiLoader = false,
    controls = undefined,
}: DocComponentPreviewProps) {
    const Demo = demos[name]

    /**
     * Controlled values for the demos, sliders, colors, etc.
     */
    const defaults = controls
        ? Object.fromEntries(Object.entries(controls).map(([key, { value }]) => [key, value]))
        : {}

    const [controlledValues, setControlledValues] = useState<Record<string, ControlValue>>(defaults)

    const updateControlledValues = (key: string, value: ControlValue) => {
        setControlledValues((prev) => ({ ...prev, [key]: value }))
    }
    const resetControlledValues = () => {
        setControlledValues(defaults)
    }

    return (
        <Tabs
            tabs={[
                { label: "Live preview", value: "preview" },
                { label: "Source code", value: "code" },
            ]}
            defaultValue="preview"
            contents={{
                preview: (
                    <div className="overflow-hidden relative">
                        <div className="w-full relative min-h-133 overflow-hidden border rounded-lg mb-5">
                            <GridPattern
                                strokeColor="oklch(0.72 0 0 / 0.15)"
                                hoverEffect={false}
                                gridSize={28}
                            />

                            {dreiLoader && <Docr3fDemoLoader />}

                            {Demo && <Demo {...controlledValues} />}
                        </div>

                        {controls && (
                            <ControlsPanel
                                controls={controls}
                                onChange={updateControlledValues}
                                onReset={resetControlledValues}
                                values={controlledValues}
                            />
                        )}
                    </div>
                ),
                code: (
                    <div className="flex flex-col overflow-scroll rounded-sm">
                        {/* Shiki is SSR: passed as slot to avoid 'use client' conflict */}
                        {codePreviewSlot}
                    </div>
                ),
            }}
        />
    )
}
