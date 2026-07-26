import type { ControlDef } from "@/types/controls"

export const controls: Record<string, ControlDef> = {
    zoomAmount: { type: "slider", value: 3, min: 3, max: 10, step: 1 },
    lerpValue: { type: "slider", value: 0.08, min: 0.01, max: 0.2, step: 0.01 },
    backgroundSpeed: { type: "slider", value: 0.2, min: 0, max: 1, step: 0.1 },
}
