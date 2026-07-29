import type { ControlDef, ControlValue } from "@/types/controls"

export function controlDefaults(
    controls: Record<string, ControlDef>,
): Record<string, ControlValue> {
    return Object.fromEntries(Object.entries(controls).map(([key, { value }]) => [key, value]))
}

function roundToStep(value: number, step: number): number {
    const decimals = (step.toString().split(".")[1] ?? "").length
    return Number(value.toFixed(decimals))
}

function formatValue(control: ControlDef, value: ControlValue): string {
    if (typeof value === "string") return JSON.stringify(value)
    if (Array.isArray(value)) return `{[${value.map((item) => JSON.stringify(item)).join(", ")}]}`
    if (typeof value === "number" && control.type === "slider") {
        return `{${roundToStep(value, control.step)}}`
    }
    return `{${value}}`
}

export function formatControlProps(
    controls: Record<string, ControlDef>,
    overrides: Record<string, ControlValue>,
): string {
    const values = { ...controlDefaults(controls), ...overrides }

    return Object.entries(controls)
        .filter(([, control]) => !control.showIf || values[control.showIf] === true)
        .map(([key, control]) => `${key}=${formatValue(control, values[key])}`)
        .join(" ")
}
