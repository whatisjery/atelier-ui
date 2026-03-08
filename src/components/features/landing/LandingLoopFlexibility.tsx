import { motion, useMotionValue } from "motion/react"
import DashedFrame from "@/components/ui/DashedFrame"
import { power4InOut } from "@/lib/easing"

const strength = 0.35

const shrink = [1, 1, 1 - strength, 1 - strength, 1 + strength, 1 + strength, 1]
const grow = [1, 1, 1 + strength, 1 + strength, 1 - strength, 1 - strength, 1]
const segments = shrink.length - 1
const times = Array.from({ length: shrink.length }, (_, i) => i / segments)
const toPercent = (vals: number[]) => vals.map((v) => `${v * 100}%`)

const cells = [
    {
        anchor: "top-0 left-0",
        w: toPercent(shrink),
        h: toPercent(grow),
    },
    {
        anchor: "top-0 right-0",
        w: toPercent(grow),
        h: toPercent(grow),
    },
    {
        anchor: "bottom-0 left-0",
        w: toPercent(shrink),
        h: toPercent(shrink),
    },
    {
        anchor: "bottom-0 right-0",
        w: toPercent(grow),
        h: toPercent(shrink),
    },
] as const

export default function LandingLoopFlexibility() {
    const width = useMotionValue("100%")
    const height = useMotionValue("100%")

    return (
        <div role="presentation" aria-label="Flexibility" className="h-full grid grid-cols-2 gap-3">
            {cells.map(({ anchor, w, h }) => (
                <div key={anchor} className="relative w-full h-full">
                    <motion.div
                        className={`bg-mat-4 absolute rounded-lg ${anchor}`}
                        style={anchor === "bottom-0 left-0" ? { width, height } : undefined}
                        animate={{ width: w, height: h }}
                        transition={{
                            duration: 6,
                            repeat: Infinity,
                            ease: power4InOut,
                            times,
                        }}
                    />
                    {anchor === "bottom-0 left-0" && (
                        <motion.div
                            className={`absolute ${anchor} z-1 pointer-events-none`}
                            style={{ width, height }}
                        >
                            <DashedFrame className="absolute inset-0 w-full h-full" />
                        </motion.div>
                    )}
                </div>
            ))}
        </div>
    )
}
