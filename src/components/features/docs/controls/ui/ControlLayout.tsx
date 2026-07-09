import { toKebabCase } from "@/lib/utils"

type ControlLayoutProps = {
    label: string
    children: React.ReactNode
}

export default function ControlLayout({ label, children }: ControlLayoutProps) {
    return (
        <div className="flex min-h-control-h items-center gap-2 mb-2">
            <div className="flex w-22 shrink-0 min-w-0 text-xs">{toKebabCase(label)}</div>

            {children}
        </div>
    )
}
