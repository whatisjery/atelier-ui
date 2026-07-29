import { Plus, X } from "lucide-react"
import Button from "@/components/ui/Button"
import { toKebabCase } from "@/lib/utils"
import type { ControlPalette } from "@/types/controls"
import ColorControl from "./ColorControl"

const NEW_SWATCH = "#ffffff"

type PaletteControlProps = {
    label: string
    control: ControlPalette
    value: string[]
    onChange: (value: string[]) => void
}

export default function PaletteControl({ label, control, value, onChange }: PaletteControlProps) {
    const setColor = (index: number, color: string) =>
        onChange(value.map((item, i) => (i === index ? color : item)))

    const addColor = () => {
        if (value.length >= control.max) return
        onChange([...value, NEW_SWATCH])
    }

    const removeColor = (index: number) => {
        if (value.length <= control.min) return
        onChange(value.filter((_, i) => i !== index))
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="text-xs">{toKebabCase(label)}</div>

            {value.map((color, index) => (
                <ColorControl
                    variant="stacked"
                    key={index}
                    label=""
                    control={{ type: "color", value: color }}
                    value={color}
                    onChange={(next) => setColor(index, next)}
                    slot={
                        <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Remove color"
                            className="disabled:opacity-20 disabled:pointer-events-none"
                            disabled={value.length <= control.min}
                            onClick={() => removeColor(index)}
                        >
                            <X strokeWidth={1.5} className="size-4" />
                        </Button>
                    }
                />
            ))}

            <Button
                variant="primary"
                size="tag"
                className="w-full"
                disabled={value.length >= control.max}
                onClick={addColor}
            >
                <Plus className="size-3.5" />
                Add color
            </Button>
        </div>
    )
}
