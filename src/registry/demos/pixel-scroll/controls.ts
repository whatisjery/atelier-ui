import type { ControlDef } from "@/types/controls"

export const controls: Record<string, ControlDef> = {
    density: { type: "slider", value: 20, min: 4, max: 200, step: 1 },
    colorRatio: { type: "slider", value: 0.25, min: 0, max: 1, step: 0.05 },
    randomness: { type: "slider", value: 0.4, min: 0, max: 1, step: 0.05 },
}
