"use client"

import { RotateCcw, Settings2 } from "lucide-react"
import { useTranslations } from "next-intl"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import Tooltip from "@/components/ui/Tooltip"
import type { ControlDef, ControlValue } from "@/types/controls"
import ControlFields from "./ControlFields"

type ControlsPanelProps = {
    controls: Record<string, ControlDef>
    onChange: (key: string, value: ControlValue) => void
    values: Record<string, ControlValue>
    onReset: () => void
}

export default function ControlsPanel({ controls, onChange, onReset, values }: ControlsPanelProps) {
    const tControls = useTranslations("docs.controls")
    const controlKeys = Object.keys(controls)

    return (
        <>
            <Card
                headerSlot={
                    <>
                        <h2 className="text-sm font-medium not-prose flex items-center gap-2">
                            <Settings2 className="size-4 text-accent-3" aria-hidden={true} />
                            {tControls("component-controls")}
                        </h2>

                        <Tooltip title={tControls("reset-controls")}>
                            <Button
                                aria-label="Reset controls"
                                onClick={onReset}
                                size="icon"
                                variant="ghost"
                            >
                                <RotateCcw strokeWidth={1.5} className="size-4" />
                            </Button>
                        </Tooltip>
                    </>
                }
            >
                <div className="flex flex-col relative sm:grid sm:grid-cols-2 gap-x-8 p-5">
                    {controlKeys.map((key) => (
                        <div className="relative mb-3 pb-3 sm:border-b border-dashed" key={key}>
                            <ControlFields
                                label={key}
                                control={controls[key]}
                                onChange={(value: ControlValue) => onChange(key, value)}
                                value={values[key] ?? controls[key].value}
                            />
                        </div>
                    ))}
                </div>
            </Card>

            <span className="text-xs flex items-center justify-end mt-1 px-2 text-accent-2">
                {tControls("controls-description")}
            </span>
        </>
    )
}
