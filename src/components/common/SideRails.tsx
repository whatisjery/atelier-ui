import { cn } from "@/lib/utils"

type SideRailsProps = {
    children: React.ReactNode
    className?: string
}

export default function SideRails({ children, className }: SideRailsProps) {
    return (
        <div className={cn("relative", className)}>
            <div className="max-md:hidden before:bg-fixed pattern-line z-2 border-r h-full w-10 absolute left-0 bg-bg top-0" />
            <div className="max-md:hidden before:bg-fixed pattern-line z-2 border-l h-full w-10 absolute right-0 bg-bg top-0" />

            {children}
        </div>
    )
}
