import { useTheme } from "next-themes"
import {
    MagneticDotGrid,
    type MagneticDotGridProps,
} from "@/registry/base/magnetic-dot-grid/magnetic-dot-grid"

export default function MagneticDotGridDemo(controls: Partial<MagneticDotGridProps>) {
    const { resolvedTheme } = useTheme()
    const isDark = resolvedTheme === "dark"

    return (
        <>
            <div className="absolute inset-0 flex items-center justify-center font-serif xs:text-5xl text-center text-4xl z-3 pointer-events-none">
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
                className="bg-bg absolute z-2 inset-0 touch-none w-full h-full"
                {...controls}
            />
        </>
    )
}
