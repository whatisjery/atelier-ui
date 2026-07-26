"use client"

import { Lock, RotateCcw } from "lucide-react"
import { useTranslations } from "next-intl"
import Button from "@/components/ui/Button"
import Tooltip from "@/components/ui/Tooltip"
import { cn } from "@/lib/utils"

type ControlPanelProps = {
    children: React.ReactNode
    onReset: () => void
    onExport?: () => void
    locked?: boolean
    headerSlot?: React.ReactNode
    headerActionsSlot?: React.ReactNode
    className?: string
}

export default function ControlPanel({
    children,
    onReset,
    onExport = undefined,
    locked = false,
    headerSlot = undefined,
    headerActionsSlot = undefined,
    className = undefined,
}: ControlPanelProps) {
    const tControls = useTranslations("docs.controls")

    return (
        <div className={cn("flex h-full flex-col overflow-hidden border bg-bg", className)}>
            <header className="h-12 shrink-0 border-b bg-bg flex items-center justify-between gap-2 px-3">
                <div className="flex min-w-0 items-center gap-2">{headerSlot}</div>

                <div className="flex shrink-0 items-center gap-1">
                    <Tooltip title={tControls("restore-defaults")}>
                        <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Restore default settings"
                            onClick={onReset}
                        >
                            <RotateCcw strokeWidth={1.5} className="size-4" />
                        </Button>
                    </Tooltip>

                    {headerActionsSlot}
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-5">{children}</div>

            {onExport && (
                <div className="border-t p-5 flex flex-col">
                    <Button variant="secondary" size="big" className="w-full" onClick={onExport}>
                        {tControls("export-component")}
                        {locked && <Lock className="size-3 shrink-0" />}
                    </Button>
                </div>
            )}
        </div>
    )
}
