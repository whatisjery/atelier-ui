"use client"

import { Check, ChevronDown } from "lucide-react"
import { Select } from "radix-ui"
import type { ControlSelect } from "@/types/controls"

type SelectControlProps = {
    label: string
    control: ControlSelect
    value: string
    onChange: (value: string) => void
}

export default function SelectControl({ label, control, value, onChange }: SelectControlProps) {
    return (
        <Select.Root value={value} onValueChange={onChange}>
            <Select.Trigger
                className="h-10 bg-accent-5 data-[state=open]:bg-bg hover:bg-bg w-[calc(100%+0.5rem)] mx-[-0.25rem] flex items-center justify-between cursor-pointer rounded border p-3 font-mono text-sm"
                aria-label={label}
            >
                <Select.Value />

                <Select.Icon>
                    <ChevronDown className="size-3 text-accent-2" />
                </Select.Icon>
            </Select.Trigger>

            <Select.Portal>
                <Select.Content
                    position="popper"
                    sideOffset={4}
                    className="min-w-[var(--radix-select-trigger-width)] rounded-xl border bg-bg p-1"
                >
                    <Select.Viewport>
                        {control.options.map((option) => (
                            <Select.Item
                                key={option}
                                value={option}
                                className="flex justify-between items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-mono cursor-pointer outline-none hover:bg-accent-5"
                            >
                                <Select.ItemText className="flex items-center justify-between w-full">
                                    <span>({label}) </span>
                                    <span>{option}</span>
                                </Select.ItemText>

                                <Select.ItemIndicator>
                                    <Check className="size-3" />
                                </Select.ItemIndicator>
                            </Select.Item>
                        ))}
                    </Select.Viewport>
                </Select.Content>
            </Select.Portal>
        </Select.Root>
    )
}
