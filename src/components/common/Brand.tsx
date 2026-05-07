import { BRAND, VERSION } from "@/lib/constants"
import { cn } from "@/lib/utils"
import Logo from "./Logo"

type BrandProps = {
    slot?: React.ReactNode
    className?: string
    version?: boolean
}

export default function Brand({ className, version = false }: BrandProps) {
    return (
        <span className={cn("flex w-fit items-center gap-x-1.5", className)}>
            <Logo />

            <p className="font-serif text-xl whitespace-nowrap">
                {BRAND}
                <sup>&reg;</sup>
            </p>

            {version && <span className="text-accent-3 font-serif text-xl">({VERSION})</span>}
        </span>
    )
}
