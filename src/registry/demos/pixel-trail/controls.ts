import type { ControlDef } from "@/types/controls"

export const controls: Record<string, ControlDef> = {
    mode: { type: "select", value: "sample", options: ["color", "sample"] },
    color: { type: "color", value: "#000000" },
    lighten: { type: "slider", value: 20, min: 0, max: 255, step: 1 },
    pixelSize: { type: "slider", value: 20, min: 1, max: 50, step: 1 },
    trailRadius: { type: "slider", value: 2, min: 0, max: 10, step: 1 },
    lifetime: { type: "slider", value: 1, min: 0, max: 10, step: 1 },
    fade: { type: "slider", value: 0.5, min: 0, max: 1, step: 0.1 },
}
