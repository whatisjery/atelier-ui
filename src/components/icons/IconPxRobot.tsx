"use client"

import type { SVGProps } from "react"

type IconReactIconProps = {
    size?: number
    className?: string
} & SVGProps<SVGSVGElement>

export function IconPxRobot({ size = 48, className, ...rest }: IconReactIconProps) {
    return (
        <svg
            role="img"
            aria-label="Px Robot Icon"
            width={size}
            height={size}
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            {...rest}
        >
            <path
                d="m30.47 18.28 0 -10.66 -1.52 0 0 9.14 -1.52 0 0 -1.52 -1.53 0 0 12.19 1.53 0 0 -1.53 3.04 0 0 -1.52 1.53 0 0 -6.1 -1.53 0z"
                fill="currentColor"
            />
            <path d="M24.38 12.19h1.52v3.05h-1.52Z" fill="currentColor" />
            <path
                d="m6.09 27.43 0 1.52 1.53 0 0 1.53 1.52 0 0 -1.53 13.71 0 0 1.53 1.53 0 0 -1.53 1.52 0 0 -1.52 -19.81 0z"
                fill="currentColor"
            />
            <path d="M22.85 18.28h1.53v3.05h-1.53Z" fill="currentColor" />
            <path d="M22.85 10.67h1.53v1.52h-1.53Z" fill="currentColor" />
            <path d="M19.81 16.76h3.04v1.52h-3.04Z" fill="currentColor" />
            <path d="M9.14 30.48h13.71V32H9.14Z" fill="currentColor" />
            <path d="M19.81 21.33h3.04v1.53h-3.04Z" fill="currentColor" />
            <path d="M18.28 18.28h1.53v3.05h-1.53Z" fill="currentColor" />
            <path d="M18.28 1.52h1.53v1.53h-1.53Z" fill="currentColor" />
            <path d="M13.71 24.38h4.57v1.52h-4.57Z" fill="currentColor" />
            <path d="M13.71 0h4.57v1.52h-4.57Z" fill="currentColor" />
            <path d="M12.19 18.28h1.52v3.05h-1.52Z" fill="currentColor" />
            <path d="M12.19 1.52h1.52v1.53h-1.52Z" fill="currentColor" />
            <path d="M9.14 16.76h3.05v1.52H9.14Z" fill="currentColor" />
            <path
                d="m22.85 10.67 0 -1.53 -6.09 0 0 -4.57 1.52 0 0 -1.52 -4.57 0 0 1.52 1.52 0 0 4.57 -6.09 0 0 1.53 13.71 0z"
                fill="currentColor"
            />
            <path d="M9.14 21.33h3.05v1.53H9.14Z" fill="currentColor" />
            <path d="M7.62 18.28h1.52v3.05H7.62Z" fill="currentColor" />
            <path d="M7.62 10.67h1.52v1.52H7.62Z" fill="currentColor" />
            <path d="M6.09 12.19h1.53v3.05H6.09Z" fill="currentColor" />
            <path
                d="m6.09 15.24 -1.52 0 0 1.52 -1.53 0 0 -9.14 -1.52 0 0 10.66 -1.52 0 0 6.1 1.52 0 0 1.52 3.05 0 0 1.53 1.52 0 0 -12.19z"
                fill="currentColor"
            />
        </svg>
    )
}
