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
            <div className="inset-0 absolute flex text-3xl flex-col font-medium items-center justify-center z-20 pointer-events-none">
                <span>Classic interactive dot pattern</span>
                <span className="text-accent-2">Move your mouse around.</span>
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
