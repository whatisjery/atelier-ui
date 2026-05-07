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
        <>
            <div className="flex items-center justify-between mb-2">
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
                className="relative group flex items-center w-full h-5 cursor-ew-resize select-none touch-none"
            >
                <Slider.Track className="relative h-0.5 rounded-full w-full bg-accent-4">
                    <Slider.Range className="absolute h-full bg-accent-2 rounded-full " />
                </Slider.Track>

                <Slider.Thumb
                    ref={thumbRef}
                    aria-label={`slider thumb ${label}`}
                    className="h-4 w-1 rounded-full bg-accent-1 block outline-hidden transition-shadow group-hover:bg-theme-bg group-focus-within:bg-theme-bg group-hover:ring-5 group-hover:ring-theme-bg/10"
                />
            </Slider.Root>
        </>
    )
}
