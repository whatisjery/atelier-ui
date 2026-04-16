import { useTheme } from "next-themes"
import { DEFAULT_PIXEL_SIZE } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { PixelTrail } from "@/registry/base/pixel-trail/pixel-trail"

type StaticPixelGridProps = {
    pixelSize?: number
    className?: string
    style?: React.CSSProperties
    position?: "top left" | "top right" | "bottom left" | "bottom right" | "center"
}

export default function BackgroundPixelGrid({
    pixelSize = DEFAULT_PIXEL_SIZE,
    position = "top left",
    className,
    style,
}: StaticPixelGridProps) {
    const { resolvedTheme } = useTheme()

    return (
        <>
            <PixelTrail
                color={resolvedTheme === "dark" ? "#19191B" : "#F6F6F6"}
                pixelSize={pixelSize}
                fade={0}
                className={cn("absolute inset-0 z-1", className)}
            />

            <div
                className={cn("absolute inset-0 opacity-[0.5]", className)}
                style={{
                    backgroundSize: `${pixelSize}px ${pixelSize}px`,
                    backgroundPosition: position,
                    clipPath: "inset(2px 0px 2px 0px)",
                    backgroundImage: [
                        `linear-gradient(to right, var(--color-border) 1px, transparent 1px)`,
                        `linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)`,
                    ].join(", "),
                    ...style,
                }}
            />
        </>
    )
}
