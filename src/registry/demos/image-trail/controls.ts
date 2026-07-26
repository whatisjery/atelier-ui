import type { ControlDef } from "@/types/controls"

export const controls: Record<string, ControlDef> = {
    driftAmount: { type: "slider", value: 36, min: 1, max: 200, step: 5 },
    spawnDistance: { type: "slider", value: 76, min: 1, max: 200, step: 5 },
    removeDelay: { type: "slider", value: 1, min: 0.1, max: 2, step: 0.1 },
}
