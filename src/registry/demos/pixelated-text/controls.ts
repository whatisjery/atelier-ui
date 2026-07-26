import type { ControlDef } from "@/types/controls"

export const controls: Record<string, ControlDef> = {
    pixelSize: { type: "slider", value: 7, min: 0, max: 15, step: 0.1 },
    chaos: { type: "slider", value: 0.2, min: 0, max: 15, step: 0.1 },
    depth: { type: "slider", value: 8.3, min: 0, max: 15, step: 0.1 },
    fps: { type: "slider", value: 200, min: 50, max: 500, step: 1 },
}
