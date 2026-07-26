import type { ControlDef } from "@/types/controls"

export const controls: Record<string, ControlDef> = {
    type: { type: "select", value: "image", options: ["image", "video"] },
    gridSize: { type: "slider", value: 22, min: 8, max: 80, step: 1 },
    interactionRadius: { type: "slider", value: 4, min: 1, max: 20, step: 1 },
    strength: { type: "slider", value: 1.65, min: 0, max: 2, step: 0.05 },
    aberration: { type: "slider", value: 0.25, min: 0, max: 2, step: 0.05 },
    trail: { type: "slider", value: 0.93, min: 0.8, max: 0.99, step: 0.01 },
    webglEnabled: { type: "boolean", value: true },
}
