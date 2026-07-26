import type { ControlDef } from "@/types/controls"

export const controls: Record<string, ControlDef> = {
    type: { type: "select", value: "image", options: ["image", "video"] },
    intensity: { type: "slider", value: 0.2, min: 0, max: 1, step: 0.01 },
    radius: { type: "slider", value: 12, min: 0, max: 50, step: 1 },
    expandRate: { type: "slider", value: 11, min: 0, max: 20, step: 1 },
    decayRate: { type: "slider", value: 3, min: 3, max: 10, step: 1 },
    webglEnabled: { type: "boolean", value: true },
}
