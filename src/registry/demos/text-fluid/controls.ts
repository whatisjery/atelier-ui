import type { ControlDef } from "@/types/controls"

export const controls: Record<string, ControlDef> = {
    speed: { type: "slider", value: 0.2, min: 0, max: 5, step: 0.1 },
    opacity: { type: "slider", value: 1, min: 0, max: 1, step: 0.01 },
    ripple: { type: "slider", value: 0.015, min: 0, max: 0.1, step: 0.005 },
    amplitude: { type: "slider", value: 0.002, min: 0, max: 0.05, step: 0.001 },
    frequency: { type: "slider", value: 1.5, min: 0.1, max: 5, step: 0.1 },
    segments: { type: "slider", value: 20, min: 1, max: 40, step: 1 },
    webglEnabled: { type: "boolean", value: true },
}
