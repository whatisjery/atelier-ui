import type { ControlDef } from "@/types/controls"

export const controls: Record<string, ControlDef> = {
    type: { type: "select", value: "image", options: ["image", "video"] },
    size: { type: "slider", value: 0.12, min: 0, max: 0.5, step: 0.01 },
    softness: { type: "slider", value: 0.5, min: 0, max: 0.5, step: 0.01 },
    aberration: { type: "slider", value: 0.18, min: 0, max: 0.2, step: 0.005 },
    dispersion: { type: "slider", value: 35, min: 2, max: 64, step: 1 },
    refraction: { type: "slider", value: 0.4, min: 0, max: 0.5, step: 0.01 },
    smoothing: { type: "slider", value: 7, min: 1, max: 30, step: 1 },
    webglEnabled: { type: "boolean", value: true },
}
