"use client"

import type { SVGProps } from "react"

type IconLaboratoryProps = {
    size?: number
    className?: string
} & SVGProps<SVGSVGElement>

export function IconLaboratory({ size = 48, className, ...rest }: IconLaboratoryProps) {
    return (
        <svg
            role="img"
            aria-label="Hand Cross Finger Heart Streamline Icon"
            width={size}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            id="Hand-Cross-Finger-Heart--Streamline-Pixel"
            className={className}
            {...rest}
        >
            <g>
                <path
                    d="M24.385 18.29v1.52h-1.52v4.57h1.52v1.53h1.52v1.52h1.53v-1.52h1.52v-1.53h1.52v-4.57h-1.52v-1.52h-1.52v-4.57h-1.53v4.57Zm3.05 1.52v1.53h1.52v1.52h-1.52v1.52h-1.53v-1.52h-1.52v-1.52h1.52v-1.53Z"
                    fill="currentColor"
                    strokeWidth="1"
                ></path>
                <path d="M24.385 27.43h1.52v3.05h-1.52Z" fill="currentColor" strokeWidth="1"></path>
                <path d="M24.385 10.67h1.52v3.05h-1.52Z" fill="currentColor" strokeWidth="1"></path>
                <path d="M22.865 9.15h1.52v1.52h-1.52Z" fill="currentColor" strokeWidth="1"></path>
                <path d="M3.055 30.48h21.33V32H3.055Z" fill="currentColor" strokeWidth="1"></path>
                <path
                    d="M19.815 13.72h1.52v12.19h-1.52Z"
                    fill="currentColor"
                    strokeWidth="1"
                ></path>
                <path d="M19.815 7.62h3.05v1.53h-3.05Z" fill="currentColor" strokeWidth="1"></path>
                <path d="M18.285 12.19h1.53v1.53h-1.53Z" fill="currentColor" strokeWidth="1"></path>
                <path
                    d="m10.675 10.67 0 1.52 4.57 0 0 3.05 1.52 0 0 -3.05 1.52 0 0 -1.52 -7.61 0z"
                    fill="currentColor"
                    strokeWidth="1"
                ></path>
                <path d="M13.715 15.24h1.53v1.53h-1.53Z" fill="currentColor" strokeWidth="1"></path>
                <path
                    d="m10.675 6.1 0 1.52 9.14 0 0 -1.52 -3.05 0 0 -1.53 -1.52 0 0 1.53 -4.57 0z"
                    fill="currentColor"
                    strokeWidth="1"
                ></path>
                <path d="M7.625 16.77h6.09v3.04h-6.09Z" fill="currentColor" strokeWidth="1"></path>
                <path d="M9.145 7.62h1.53v3.05h-1.53Z" fill="currentColor" strokeWidth="1"></path>
                <path
                    d="m15.245 4.57 0 -1.52 -1.53 0 0 -3.05 -6.09 0 0 3.05 -1.53 0 0 1.52 9.15 0z"
                    fill="currentColor"
                    strokeWidth="1"
                ></path>
                <path d="M6.095 15.24h1.53v1.53h-1.53Z" fill="currentColor" strokeWidth="1"></path>
                <path
                    d="M19.815 27.43v-1.52h-6.1v-1.53h3.05v-1.52H4.575v1.52h3.05v1.53h-4.57v1.52Zm-10.67 -3.05H12.2v1.53H9.145Z"
                    fill="currentColor"
                    strokeWidth="1"
                ></path>
                <path d="M4.575 4.57h1.52v10.67h-1.52Z" fill="currentColor" strokeWidth="1"></path>
                <path d="M1.525 27.43h1.53v3.05h-1.53Z" fill="currentColor" strokeWidth="1"></path>
            </g>
        </svg>
    )
}
