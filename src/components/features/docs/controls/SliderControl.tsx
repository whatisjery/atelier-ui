import { Slider } from "radix-ui"
import { type ComponentRef, useRef, useState } from "react"
import type { ControlSlider } from "@/types/controls"
import ControlLayout from "./ui/ControlLayout"
import Value from "./ui/Value"

type SliderControlProps = {
    label: string
    control: ControlSlider
    value: number
    onChange: (value: number) => void
    disabled?: boolean
}

export default function SliderControl({
    label,
    control,
    value,
    onChange,
    disabled = false,
}: SliderControlProps) {
    const [dragging, setDragging] = useState<number | null>(null)
    const displayValue = dragging ?? value
    const decimals = (control.step.toString().split(".")[1] || "").length
    const thumbRef = useRef<ComponentRef<"button">>(null)

    return (
        <ControlLayout label={label}>
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
                disabled={disabled}
                aria-label={label}
                className="relative group flex flex-1 min-w-0 items-center h-5 cursor-ew-resize select-none touch-none data-[disabled]:pointer-events-none"
            >
                <Slider.Track className="relative h-1 rounded-sm w-full bg-accent-4">
                    <Slider.Range className="absolute h-full bg-accent-4 rounded-sm" />
                </Slider.Track>

                <Slider.Thumb
                    ref={thumbRef}
                    aria-label={`slider thumb ${label}`}
                    className="h-3 w-0.5 rounded-full bg-accent-1 block outline-hidden transition-shadow group-hover:bg-theme-bg group-focus-within:bg-theme-bg group-hover:ring-5 group-hover:ring-theme-bg/10"
                />
            </Slider.Root>

            <div className="w-12 shrink-0">
                <Value>{displayValue.toFixed(decimals)}</Value>
            </div>
        </ControlLayout>
    )
}
