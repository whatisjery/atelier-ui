import type { ControlDef } from "@/types/controls"

export const controls: Record<string, ControlDef> = {
    rows: { type: "slider", value: 7, min: 2, max: 10, step: 1 },
    columns: { type: "slider", value: 12, min: 4, max: 30, step: 1 },
    latitudeRange: { type: "slider", value: 85, min: 10, max: 90, step: 5 },
    gap: { type: "slider", value: 0.01, min: 0, max: 0.3, step: 0.01 },
    padding: { type: "slider", value: 0.03, min: 0, max: 0.5, step: 0.01 },
    cornerRadius: { type: "slider", value: 0.02, min: 0, max: 0.6, step: 0.01 },
    tileColor: { type: "color", value: "#F8F8F8" },
    sphereColor: { type: "color", value: "#ffffff" },
    showTileColor: { type: "boolean", value: true },
    lensBlur: { type: "slider", value: 0.4, min: 0, max: 0.5, step: 0.01 },
    fov: { type: "slider", value: 70, min: 25, max: 100, step: 1 },
    revealDuration: { type: "slider", value: 2, min: 0, max: 4, step: 0.1 },
    focusDuration: { type: "slider", value: 1, min: 0, max: 4, step: 0.1 },
    focusScale: { type: "slider", value: 1.7, min: 1, max: 3, step: 0.1 },
    mouseParallax: { type: "slider", value: 0.2, min: 0, max: 1, step: 0.05 },
}
