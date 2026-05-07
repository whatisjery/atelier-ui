"use client"

import { cn } from "@/lib/utils"

type IconLogoProps = Omit<React.SVGProps<SVGSVGElement>, "width" | "height"> & {
    size?: number
    className?: string
}

export default function Logo({ size = 18, className, ...props }: IconLogoProps) {
    return (
        <svg
            aria-label="Atelier UI Logo"
            role="img"
            width={size}
            height={size}
            viewBox="0 0 48 48"
            xmlns="http://www.w3.org/2000/svg"
            className={cn("text-accent-1", className)}
            {...props}
        >
            <path
                fill="currentColor"
                d="M14.1874 45.4802H1.11719V31.2061L20.7379 2.51562H33.8037V20.0335H46.8819V45.4802H27.2784V24.0106L14.1874 45.4802Z"
            />
        </svg>
    )
}
