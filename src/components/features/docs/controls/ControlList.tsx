import { cn } from "@/lib/utils"
import type { ControlDef, ControlValue } from "@/types/controls"
import ControlFields from "./ControlFields"

type Controls = Record<string, ControlDef>
type Entry = [string, ControlDef]

type ControlListProps = {
    controls: Controls
    values: Record<string, ControlValue>
    onChange: (key: string, value: ControlValue) => void
    fieldsClassName?: string
}

type Category = "input" | "toggle" | "swatch"

function category(control: ControlDef, controls: Controls): Category {
    const parent = control.showIf ? controls[control.showIf] : undefined

    if (parent) return category(parent, controls)
    if (control.type === "boolean") return "toggle"
    if (control.type === "color" || control.type === "palette") return "swatch"

    return "input"
}

function startsNewCategory(entries: Entry[], index: number, controls: Controls): boolean {
    if (index === 0) return false

    const [, previous] = entries[index - 1]
    const [, current] = entries[index]

    return category(current, controls) !== category(previous, controls)
}

export default function ControlList({
    controls,
    values,
    onChange,
    fieldsClassName,
}: ControlListProps) {
    const visible = Object.entries(controls).filter(
        ([, control]) => !control.showIf || values[control.showIf] === true,
    )

    return (
        <div className={cn(fieldsClassName)}>
            {visible.map(([key, control], index) => (
                <div
                    key={key}
                    className={cn("relative mb-3", {
                        "border-t border-dashed mt-5 pt-5": startsNewCategory(
                            visible,
                            index,
                            controls,
                        ),
                    })}
                >
                    <ControlFields
                        label={key}
                        control={control}
                        value={values[key] ?? control.value}
                        onChange={(value) => onChange(key, value)}
                    />
                </div>
            ))}
        </div>
    )
}
