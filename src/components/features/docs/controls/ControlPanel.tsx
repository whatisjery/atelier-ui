// ControlsPanel.tsx
"use client"

import { RotateCcw } from "lucide-react"
import { useTranslations } from "next-intl"
import Button from "@/components/ui/Button"
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
    const t = useTranslations("docs.controls")

    return (
        <div className="p-3 w-full relative border rounded-lg">
            <header className="flex justify-between items-center mb-5 px-3">
                <h2 className="text-sm font-medium not-prose">{t("component-controls")}</h2>
                <Tooltip title={t("reset-controls")}>
                    <Button onClick={onReset} size="icon" variant="ghost">
                        <RotateCcw className="size-4" />
                    </Button>
                </Tooltip>
            </header>

            <div className="flex flex-col sm:grid sm:grid-cols-2 gap-x-8 pt-3 sm:pt-0 pb-20">
                {Object.keys(controls).map((key) => (
                    <div key={key}>
                        <ControlFields
                            label={key}
                            control={controls[key]}
                            onChange={(value: ControlValue) => onChange(key, value)}
                            value={values[key] ?? controls[key].value}
                        />
                    </div>
                ))}
                <small className="absolute italic text-[0.6rem] bottom-4 right-5 text-mat-2/80">
                    {t("controls-description")}
                </small>
            </div>
        </div>
    )
}
