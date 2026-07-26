import type { ControlDef } from "@/types/controls"

export const controls: Record<string, ControlDef> = {
    autoScrollSpeed: { type: "slider", value: 0.02, min: 0, max: 0.5, step: 0.01 },
    parallaxAmount: { type: "slider", value: 2, min: 0, max: 10, step: 0.5 },
}
