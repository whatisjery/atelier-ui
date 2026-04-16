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
        <div className={cn("relative rounded-xl border not-prose", containerClassName)}>
            <BackgroundPixelGrid position="center" />

            <div
                className={cn(
                    "relative z-2 bg-background/2 backdrop-blur-[1px] rounded-xl",
                    className,
                )}
            >
                {children}
            </div>
        </div>
    )
}
