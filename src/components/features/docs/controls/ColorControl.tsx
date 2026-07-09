import Colorful from "@uiw/react-color-colorful"
import { type ComponentRef, useEffect, useRef, useState } from "react"
import { toKebabCase } from "@/lib/utils"
import type { ControlColor } from "@/types/controls"
import ControlLayout from "./ui/ControlLayout"
import Value from "./ui/Value"

type ColorControlProps = {
    label: string
    onChange: (value: string) => void
    control: ControlColor
    value: string
    slot?: React.ReactNode
    variant?: "inline" | "stacked"
    onReset?: () => void
}

export default function ColorControl({
    label,
    value,
    onChange,
    slot,
    variant = "inline",
}: ColorControlProps) {
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

    const body = (
        <div
            ref={ref}
            className="flex min-h-control-h items-center px-1 gap-x-2 relative bg-accent-5 flex-1 rounded-sm"
        >
            <button
                type="button"
                aria-label={`Pick a color ${displayValue}`}
                onClick={() => (open ? close() : setOpen(true))}
                className="size-5.5 rounded cursor-pointer hover:opacity-80"
                style={{ backgroundColor: displayValue }}
            />

            <Value>{displayValue.replace("#", "")}</Value>

            {slot && <div className="ml-auto mr-1 shrink-0">{slot}</div>}

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

    if (variant === "stacked") {
        return (
            <div className="flex flex-col gap-1.5">
                {label && (
                    <div className="flex items-center justify-between gap-2">
                        <div className="text-xs">{toKebabCase(label)}</div>
                    </div>
                )}
                {body}
            </div>
        )
    }

    return <ControlLayout label={label}>{body}</ControlLayout>
}
