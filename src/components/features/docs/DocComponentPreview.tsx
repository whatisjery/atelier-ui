"use client"

import { useState } from "react"
import GridPattern from "@/components/ui/GridPattern"
import Tabs from "@/components/ui/Tabs"
import { demos } from "@/registry/demos"
import type { ControlDef, ControlValue } from "@/types/controls"
import ControlsPanel from "./controls/ControlPanel"
import Docr3fDemoLoader from "./Docr3fDemoLoader"

type DocComponentPreviewProps = {
    name: string
    dreiLoader?: boolean
    controls?: Record<string, ControlDef> | undefined
    codePreviewSlot: React.ReactNode
    isSourceCodeDisabled?: boolean
}

export default function DocComponentPreview({
    name,
    codePreviewSlot,
    dreiLoader = false,
    controls = undefined,
    isSourceCodeDisabled,
}: DocComponentPreviewProps) {
    const Demo = demos[name]

    const defaults = controls
        ? Object.fromEntries(Object.entries(controls).map(([key, { value }]) => [key, value]))
        : {}

    const [controlledValues, setControlledValues] = useState<Record<string, ControlValue>>({})

    const updateControlledValues = (key: string, value: ControlValue) => {
        setControlledValues((prev) => ({ ...prev, [key]: value }))
    }
    const resetControlledValues = () => {
        setControlledValues({})
    }

    return (
        <Tabs
            tabs={[
                { label: "Live preview", value: "preview" },
                { label: "Source code", value: "code", disabled: isSourceCodeDisabled },
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

                        {controls && !isSourceCodeDisabled && (
                            <ControlsPanel
                                controls={controls}
                                onChange={updateControlledValues}
                                onReset={resetControlledValues}
                                values={{ ...defaults, ...controlledValues }}
                            />
                        )}
                    </div>
                ),
                code: (
                    <div className="flex flex-col overflow-scroll rounded-sm">
                        {!isSourceCodeDisabled && codePreviewSlot}
                    </div>
                ),
            }}
        />
    )
}
