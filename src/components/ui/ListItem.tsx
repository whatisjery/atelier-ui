import Link from "next/link"
import { cn } from "@/lib/utils"

type ListItemProps = {
    sideLine: boolean
    activeItem: boolean
    linkItem: { href: string; label: string; icon?: React.ReactNode }
    ref?: React.Ref<HTMLLIElement>
    className?: string
    leftSlot?: React.ReactNode
    onLinkClick?: React.MouseEventHandler<HTMLAnchorElement>
} & React.HTMLAttributes<HTMLLIElement>

export default function ListItem({
    sideLine,
    activeItem,
    linkItem,
    ref,
    className,
    leftSlot,
    onLinkClick,
    ...rest
}: ListItemProps) {
    return (
        <li
            {...rest}
            ref={ref}
            className={cn(
                "py-1 text-sm relative text-accent-2 flex items-center justify-between hover:text-accent-1",
                {
                    "border-l border-accent-3 pl-6 ml-2": sideLine,
                    "py-1.5": !sideLine,
                    "border-accent-1 text-accent-1 [text-shadow:0_0_0.4px_currentColor]":
                        activeItem,
                },
                className,
            )}
        >
            {activeItem && !sideLine && (
                <span className="h-full w-[calc(100%+0.8rem)] -ml-[0.4rem] absolute -z-1 inset-0 rounded-sm bg-accent-5" />
            )}

            <Link className="flex items-center gap-x-3" href={linkItem.href} onClick={onLinkClick}>
                {linkItem.icon}
                <span>{linkItem.label}</span>
            </Link>

            {leftSlot}
        </li>
    )
}
