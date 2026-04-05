import { Slider } from "radix-ui"
import { type ComponentRef, useRef, useState } from "react"
import { toKebabCase } from "@/lib/utils"
import type { ControlSlider } from "@/types/controls"
import Label from "./ui/Label"
import Value from "./ui/Value"

type SliderControlProps = {
    label: string
    control: ControlSlider
    value: number
    onChange: (value: number) => void
}

export default function SliderControl({ label, control, value, onChange }: SliderControlProps) {
    const [dragging, setDragging] = useState<number | null>(null)
    const displayValue = dragging ?? value
    const decimals = (control.step.toString().split(".")[1] || "").length
    const thumbRef = useRef<ComponentRef<"button">>(null)

    return (
        <div className="w-full p-3">
            <div className="flex items-center justify-between mb-1">
                <Label>{toKebabCase(label)}</Label>
                <Value>{displayValue.toFixed(decimals)}</Value>
            </div>

            <Slider.Root
                min={control.min}
                max={control.max}
                step={control.step}
                value={[displayValue]}
                onValueChange={([v]) => setDragging(v)}
                onValueCommit={([v]) => {
                    setDragging(null)
                    onChange(v)
                    thumbRef.current?.blur()
                }}
                aria-label={label}
                className="relative group flex items-center w-full h-5 cursor-pointer select-none touch-none"
            >
                <Slider.Track className="relative h-0.5 w-full bg-mat-4">
                    <Slider.Range className="absolute h-full bg-mat-2 group-hover:bg-highlight group-focus-within:bg-highlight rounded-full" />
                </Slider.Track>

                <Slider.Thumb
                    ref={thumbRef}
                    className="w-0.5 h-3 bg-mat-2 block outline-hidden group-hover:bg-highlight group-focus-within:bg-highlight"
                />
            </Slider.Root>
        </div>
    )
}
