"use client"

import { Pointer } from "lucide-react"
import { useTheme } from "next-themes"
import { MagneticDotGrid } from "@/registry/base/magnetic-dot-grid/magnetic-dot-grid"

export default function MagneticDotGridDemo() {
    const { resolvedTheme } = useTheme()
    return (
        <div className="w-full h-full absolute inset-0 not-prose flex items-center justify-center">
            <div className="bg-background/15 border rounded-md px-4 py-3 backdrop-blur-[1.2px] pointer-events-none font-serif absolute z-3 text-xl flex items-center gap-2">
                <Pointer strokeWidth={0.8} size={18} />
                hover anywhere.
            </div>

            <MagneticDotGrid
                spacing={resolvedTheme === "dark" ? 17 : 12}
                strength={resolvedTheme === "dark" ? 15 : 20}
                dotRadius={0.8}
                snapSpeed={resolvedTheme === "dark" ? 7 : 10}
                returnSpeed={resolvedTheme === "dark" ? 4 : 6}
                floatAmplitude={2.2}
                interactionRadius={300}
                opacityRange={resolvedTheme === "dark" ? [1, 0.1] : [1, 1]}
                baseColor={resolvedTheme === "dark" ? "#3C4051" : "#979AAC"}
                centerColors={resolvedTheme === "dark" ? ["#00FF73", "#00D9FF"] : ["#000000"]}
                cycleSpeed={0.5}
                className="bg-background absolute z-2 inset-0 touch-none w-full h-full"
            />
        </div>
    )
}
