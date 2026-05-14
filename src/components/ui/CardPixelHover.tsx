import { cn } from "@/lib/utils"
import Card from "./Card"
import BackgroundPixelGrid from "./PixelGrid"

type CardPixelBlurProps = {
    children: React.ReactNode
    className?: string
    containerClassName?: string
}

export default function CardPixelHover({
    children,
    className,
    containerClassName,
}: CardPixelBlurProps) {
    return (
        <Card className={cn("relative not-prose overflow-hidden", containerClassName)}>
            <BackgroundPixelGrid pixelSize={22} position="center" />

            <div className={cn("relative z-2 bg-bg/40 rounded-xl", className)}>{children}</div>
        </Card>
    )
}
