import { cn } from "@/lib/utils"

type CardProps = React.ComponentProps<"div"> & {
    headerSlot?: React.ReactNode
    children?: React.ReactNode
    hideHeader?: boolean
    bottomSlot?: React.ReactNode
}

export default function Card({ headerSlot, children, className, bottomSlot, ...props }: CardProps) {
    return (
        <div className={cn("border rounded-md bg-bg", className)} {...props}>
            {headerSlot && (
                <header className="h-12 border-b flex items-center justify-between px-3">
                    {headerSlot}
                </header>
            )}
            {children}
        </div>
    )
}
