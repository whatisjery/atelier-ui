import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

type AnimatedArrowProps = {
    className?: string
}

export default function AnimatedArrow({ className }: AnimatedArrowProps) {
    const cls =
        "size-4 group-hover:transition-transform group-hover:duration-400 ease-[var(--ease-expo-out)]"

    return (
        <span className={cn("overflow-hidden relative size-4", className)}>
            <ArrowRight className={cn(cls, "group-hover:translate-x-full")} />
            <ArrowRight
                className={cn(cls, "absolute inset-0 -translate-x-full group-hover:translate-x-0")}
            />
        </span>
    )
}
