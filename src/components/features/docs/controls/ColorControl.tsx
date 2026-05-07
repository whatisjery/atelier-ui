"use client"

import Colorful from "@uiw/react-color-colorful"
import { type ComponentRef, useEffect, useRef, useState } from "react"
import { toKebabCase } from "@/lib/utils"
import type { ControlColor } from "@/types/controls"
import Label from "./ui/Label"
import Value from "./ui/Value"

type ColorControlProps = {
    label: string
    onChange: (value: string) => void
    control: ControlColor
    value: string
}

export default function ColorControl({ label, value, onChange }: ColorControlProps) {
    const [open, setOpen] = useState(false)
    const [selectedColor, setSelectedColor] = useState<string | null>(null)
    const displayValue = selectedColor ?? value
    const ref = useRef<ComponentRef<"div">>(null)

    function selectColor() {
        if (selectedColor === null) return
        onChange(selectedColor)
        setSelectedColor(null)
    }

    function close() {
        selectColor()
        setOpen(false)
    }

    useEffect(() => {
        if (!open) return

        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                close()
            }
        }

        window.addEventListener("pointerdown", handleClickOutside)
        return () => window.removeEventListener("pointerdown", handleClickOutside)

        // biome-ignore lint/correctness/useExhaustiveDependencies: React compiler
    }, [open, close])

    return (
        <div ref={ref} className="flex items-center relative">
            <div className="w-full flex items-center justify-between">
                <span className="flex items-center gap-4">
                    <button
                        type="button"
                        aria-label={`Pick a color ${displayValue}`}
                        onClick={() => (open ? close() : setOpen(true))}
                        className="size-10 cursor-pointer border hover:opacity-80 rounded flex items-center justify-center bg-accent-5"
                    >
                        <div className="size-4 rounded" style={{ backgroundColor: displayValue }} />
                    </button>
                    <Label>{toKebabCase(label)}</Label>
                </span>

                <Value>{displayValue}</Value>
            </div>

            {open && (
                <div className="absolute bottom-0 right-0 z-50">
                    <Colorful
                        color={displayValue}
                        onChange={(color) => setSelectedColor(color.hex)}
                        onPointerUp={selectColor}
                        disableAlpha
                    />
                </div>
            )}
        </div>
    )
}
