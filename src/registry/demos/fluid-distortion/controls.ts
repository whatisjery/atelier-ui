import type { ControlDef } from "@/types/controls"

export const controls: Record<string, ControlDef> = {
    intensity: { type: "slider", value: 7, min: 0, max: 10, step: 0.01 },
    force: { type: "slider", value: 1.1, min: 0, max: 20, step: 0.01 },
    distortion: { type: "slider", value: 0.8, min: 0, max: 2, step: 0.01 },
    radius: { type: "slider", value: 0.65, min: 0, max: 1, step: 0.01 },
    curl: { type: "slider", value: 0.8, min: 0, max: 50, step: 0.01 },
    swirl: { type: "slider", value: 2, min: 0, max: 20, step: 0.01 },
    velocityDissipation: { type: "slider", value: 0.98, min: 0, max: 0.99, step: 0.01 },
    densityDissipation: { type: "slider", value: 0.98, min: 0, max: 0.99, step: 0.01 },
    pressure: { type: "slider", value: 0.7, min: 0, max: 1, step: 0.01 },
    fluidColor: { type: "color", value: "#b4a6ff" },
    showBackground: { type: "boolean", value: false },
    rainbow: { type: "boolean", value: false },
    backgroundColor: { type: "color", value: "#070410" },
}
