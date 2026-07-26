import type { ControlDef } from "@/types/controls"

export const controls: Record<string, ControlDef> = {
    duration: { type: "slider", value: 0.7, min: 0, max: 10, step: 0.1 },
    scrambleFps: { type: "slider", value: 30, min: 1, max: 60, step: 1 },
    playOnMount: { type: "boolean", value: true },
    playOnHover: { type: "boolean", value: true },
}
