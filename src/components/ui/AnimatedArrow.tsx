import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react"
import { cn } from "@/lib/utils"

type AnimatedArrowDirection = "left" | "right" | "down" | "up"

type AnimatedArrowProps = {
    className?: string
    direction?: AnimatedArrowDirection
}

const ARROWS = {
    right: {
        Icon: ArrowRight,
        out: "group-hover:translate-x-full",
        enter: "-translate-x-full group-hover:translate-x-0",
    },
    left: {
        Icon: ArrowLeft,
        out: "group-hover:-translate-x-full",
        enter: "translate-x-full group-hover:translate-x-0",
    },
    down: {
        Icon: ArrowDown,
        out: "group-hover:translate-y-full",
        enter: "-translate-y-full group-hover:translate-y-0",
    },
    up: {
        Icon: ArrowUp,
        out: "group-hover:-translate-y-full",
        enter: "translate-y-full group-hover:translate-y-0",
    },
} as const

export default function AnimatedArrow({ className, direction = "right" }: AnimatedArrowProps) {
    const { Icon, out, enter } = ARROWS[direction]

    const cls = "size-3.5 group-hover:transition-transform group-hover:duration-500 ease-expo-out"

    return (
        <span className="relative inline-block overflow-hidden">
            <Icon className={cn(cls, out, className)} />
            <Icon className={cn(cls, "absolute inset-0", enter, className)} />
        </span>
    )
}
