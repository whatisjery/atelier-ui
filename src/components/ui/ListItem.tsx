import Link from "next/link"
import { cn } from "@/lib/utils"

type ListItemProps = {
    sideLine: boolean
    activeItem: boolean
    linkItem: { href: string; label: string; icon?: React.ReactNode }
    ref?: React.Ref<HTMLLIElement>
    className?: string
    leftSlot?: React.ReactNode
} & React.HTMLAttributes<HTMLLIElement>

export default function ListItem({
    sideLine,
    activeItem,
    linkItem,
    ref,
    className,
    leftSlot,
    ...rest
}: ListItemProps) {
    return (
        <li
            {...rest}
            ref={ref}
            className={cn(
                "py-1 text-sm text-accent-2 flex items-center justify-between hover:text-accent-1",
                {
                    "border-l border-accent-3 pl-6 ml-2": sideLine,
                    "border border-transparent": !sideLine,
                    "border-accent-1 text-accent-1 [text-shadow:0_0_0.4px_currentColor]":
                        activeItem,
                    "bg-accent-5 border-accent-3 -ml-2 pl-2 rounded-md": activeItem && !sideLine,
                },
                className,
            )}
        >
            <Link className="flex items-center gap-x-3" href={linkItem.href}>
                {linkItem.icon}
                <span>{linkItem.label}</span>
            </Link>

            {leftSlot}
        </li>
    )
}
