import type { ControlDef } from "@/types/controls"

export const controls: Record<string, ControlDef> = {
    pause: { type: "slider", value: 0, min: 0, max: 1, step: 0.05 },
    outDuration: { type: "slider", value: 0.35, min: 0.05, max: 2, step: 0.05 },
    inDuration: { type: "slider", value: 1, min: 0.05, max: 2, step: 0.05 },
    bounce: { type: "slider", value: 0.3, min: 0, max: 1, step: 0.05 },
    distance: { type: "slider", value: 35, min: 0, max: 100, step: 1 },
    rotation: { type: "slider", value: 25, min: 0, max: 45, step: 1 },
}
