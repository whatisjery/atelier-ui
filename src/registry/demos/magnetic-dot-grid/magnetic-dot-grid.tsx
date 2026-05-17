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
                baseColor={isDark ? "#3C4051" : "#000000"}
                centerColors={["#209053", "#217382"]}
                className="bg-bg absolute z-2 inset-0 touch-none w-full h-full"
                {...controls}
            />
        </>
    )
}
