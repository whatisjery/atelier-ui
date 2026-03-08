import { cn } from "@/lib/utils"

interface SplitTextProps {
    children: string
    charClassName?: string
    wordClassName?: string
    tracking?: string
}

export default function SplitText({
    children,
    charClassName,
    tracking = "-0.05em",
    wordClassName,
}: SplitTextProps) {
    const absTracking = tracking.replace("-", "")

    return (
        <>
            {children.split(" ").map((word, i) => (
                <span
                    key={i}
                    className={cn("inline-flex overflow-hidden", wordClassName)}
                    style={{ padding: `0 ${absTracking}`, margin: `0 -${absTracking}` }}
                >
                    {(i > 0 ? ` ${word}` : word).split("").map((char, j) => (
                        <span
                            key={j}
                            className={cn(
                                charClassName,
                                "inline-block whitespace-pre letter align-baseline word opacity-0",
                            )}
                            style={{ letterSpacing: tracking }}
                        >
                            {char}
                        </span>
                    ))}
                </span>
            ))}
        </>
    )
}
