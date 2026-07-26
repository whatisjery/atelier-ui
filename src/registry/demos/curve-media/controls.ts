import type { ControlDef } from "@/types/controls"

export const controls: Record<string, ControlDef> = {
    type: { type: "select", value: "image", options: ["image", "video"] },
    amplitude: { type: "slider", value: 0.05, min: 0, max: 0.15, step: 0.01 },
    aberration: { type: "slider", value: 0.03, min: 0, max: 0.06, step: 0.005 },
    smoothing: { type: "slider", value: 20, min: 1, max: 50, step: 0.5 },
    segments: { type: "slider", value: 32, min: 4, max: 64, step: 4 },
    webglEnabled: { type: "boolean", value: true },
}
