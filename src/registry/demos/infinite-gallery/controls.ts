import type { ControlDef } from "@/types/controls"

export const controls: Record<string, ControlDef> = {
    speed: { type: "slider", value: 6, min: 1, max: 10, step: 1 },
    inertia: { type: "slider", value: 0.6, min: 0, max: 0.9, step: 0.1 },
    dragMultiplier: { type: "slider", value: 3, min: 1, max: 10, step: 0.5 },
}
