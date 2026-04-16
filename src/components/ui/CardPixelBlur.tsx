import { cn } from "@/lib/utils"
import BackgroundPixelGrid from "./PixelGrid"

type CardPixelBlurProps = {
    children: React.ReactNode
    className?: string
    containerClassName?: string
}

export default function CardPixelBlur({
    children,
    className,
    containerClassName,
}: CardPixelBlurProps) {
    return (
        <div
            className={cn(
                "relative rounded-xl border not-prose overflow-hidden",
                containerClassName,
            )}
        >
            <BackgroundPixelGrid position="center" />

            <div
                className={cn(
                    "relative z-2 bg-background/7 backdrop-blur-[2px] rounded-xl",
                    className,
                )}
            >
                {children}
            </div>
        </div>
    )
}
