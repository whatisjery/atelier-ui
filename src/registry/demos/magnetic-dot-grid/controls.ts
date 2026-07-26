import type { ControlDef } from "@/types/controls"

export const controls: Record<string, ControlDef> = {
    dotRadius: { type: "slider", value: 0.6, min: 0.5, max: 5, step: 0.1 },
    spacing: { type: "slider", value: 16, min: 10, max: 100, step: 1 },
    strength: { type: "slider", value: 20, min: 0, max: 100, step: 1 },
    interactionRadius: { type: "slider", value: 500, min: 0, max: 1000, step: 1 },
    snapSpeed: { type: "slider", value: 9, min: 0, max: 10, step: 1 },
    returnSpeed: { type: "slider", value: 5, min: 0, max: 10, step: 1 },
    floatAmplitude: { type: "slider", value: 1.8, min: 0, max: 10, step: 0.1 },
    floatSpeed: { type: "slider", value: 2, min: 0, max: 10, step: 1 },
    baseColor: { type: "color", value: "#000000" },
}
