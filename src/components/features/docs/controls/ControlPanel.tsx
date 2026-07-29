import { cn } from "@/lib/utils"

type ControlPanelProps = {
    children: React.ReactNode
    footerSlot?: React.ReactNode
    className?: string
}

export default function ControlPanel({
    children,
    footerSlot = undefined,
    className = undefined,
}: ControlPanelProps) {
    return (
        <div className={cn("flex h-full flex-col overflow-hidden border bg-bg", className)}>
            <div className="flex-1 overflow-y-auto p-5 pb-10 mask-b-from-[calc(100%-5rem)]">
                {children}
            </div>

            {footerSlot}
        </div>
    )
}
