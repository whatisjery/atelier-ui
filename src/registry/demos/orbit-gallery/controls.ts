import type { ControlDef } from "@/types/controls"

export const controls: Record<string, ControlDef> = {
    radius: { type: "slider", value: 2.8, min: 0.5, max: 5, step: 0.1 },
    rings: { type: "slider", value: 3, min: 1, max: 4, step: 1 },
    ringGap: { type: "slider", value: 1.6, min: 0.3, max: 2, step: 0.1 },
    tileHeight: { type: "slider", value: 0.7, min: 0.1, max: 2, step: 0.1 },
    cornerRadius: { type: "slider", value: 0.08, min: 0, max: 0.3, step: 0.01 },
    spinSpeed: { type: "slider", value: 1, min: -10, max: 10, step: 0.5 },
    spinStagger: { type: "slider", value: 0.2, min: 0, max: 2.5, step: 0.1 },
    wheel: { type: "boolean", value: true },
    wheelMultiplier: { type: "slider", value: 3, min: 0, max: 4, step: 0.1 },
    revealDuration: { type: "slider", value: 2, min: 0, max: 4, step: 0.1 },
    focusDuration: { type: "slider", value: 1, min: 0, max: 4, step: 0.1 },
}
