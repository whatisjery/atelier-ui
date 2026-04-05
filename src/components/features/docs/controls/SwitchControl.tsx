"use client"

import { Switch } from "radix-ui"
import { toKebabCase } from "@/lib/utils"
import type { ControlBoolean } from "@/types/controls"
import Label from "./ui/Label"

type SwitchControlProps = {
    label: string
    value: boolean
    control: ControlBoolean
    onChange: (value: boolean) => void
}

export default function SwitchControl({ label, value, onChange }: SwitchControlProps) {
    return (
        <div className="flex items-center justify-between p-3">
            <Label>{toKebabCase(label)}</Label>

            <Switch.Root
                checked={value}
                onCheckedChange={onChange}
                aria-label={label}
                className="relative h-6 w-11 cursor-pointer rounded-full transition-colors hover:ring-1 hover:ring-mat-3"
                style={{ backgroundColor: value ? "var(--highlight)" : "var(--mat-4)" }}
            >
                <Switch.Thumb
                    className="block size-5 rounded-full bg-background shadow-md transition-transform"
                    style={{ transform: value ? "translateX(22px)" : "translateX(2px)" }}
                />
            </Switch.Root>
        </div>
    )
}
