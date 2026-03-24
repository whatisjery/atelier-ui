import Link from "next/link"
import { BRAND } from "@/lib/constants"
import { cn } from "@/lib/utils"
import Logo from "./Logo"

type BrandLinkProps = {
    slot?: React.ReactNode
    className?: string
}

export default function BrandLink({ slot, className }: BrandLinkProps) {
    return (
        <Link className={cn("flex items-center gap-x-1.5 hover:opacity-50", className)} href="/">
            <Logo />
            <h1 className="font-serif text-xl whitespace-nowrap">{BRAND}</h1>
            {slot}
        </Link>
    )
}
