"use client"

import { useTheme } from "next-themes"
import {
    MagneticDotGrid,
    type MagneticDotGridProps,
} from "@/registry/base/magnetic-dot-grid/magnetic-dot-grid"

export default function MagneticDotGridDemo(controls: Partial<MagneticDotGridProps>) {
    const { resolvedTheme } = useTheme()

    const isDark = resolvedTheme === "dark"
    return (
        <div className="w-full h-full absolute inset-0 not-prose flex items-center justify-center">
            <div className="font-serif xs:text-5xl text-center text-4xl relative z-5">
                hover anywhere.
            </div>

            <MagneticDotGrid
                spacing={isDark ? 17 : 12}
                strength={isDark ? 15 : 20}
                dotRadius={0.8}
                snapSpeed={isDark ? 7 : 10}
                returnSpeed={isDark ? 4 : 6}
                floatAmplitude={2.2}
                interactionRadius={300}
                opacityRange={isDark ? [1, 0.1] : [1, 1]}
                cycleSpeed={0.5}
                baseColor={isDark ? "#3C4051" : "#979AAC"}
                centerColors={isDark ? ["#00FF73", "#00D9FF"] : ["#000000"]}
                className="bg-background absolute z-2 inset-0 touch-none w-full h-full"
                {...controls}
            />
        </div>
    )
}
