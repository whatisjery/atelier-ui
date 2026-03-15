import Link from "next/link"
import { BRAND } from "@/lib/constants"
import Logo from "./Logo"

type BrandLinkProps = {
    slot?: React.ReactNode
}

export default function BrandLink({ slot }: BrandLinkProps) {
    return (
        <Link className="flex items-center gap-x-1.5 hover:opacity-50" href="/">
            <Logo />
            <h1 className="font-serif text-xl">{BRAND}</h1>
            {slot}
        </Link>
    )
}
