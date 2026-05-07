"use client"

import type { SVGProps } from "react"

type IconReactIconProps = {
    size?: number
    className?: string
} & SVGProps<SVGSVGElement>

export function IconPxHammer({ size = 48, className, ...rest }: IconReactIconProps) {
    return (
        <svg
            role="img"
            aria-label="Px Hammer Icon"
            width={size}
            height={size}
            viewBox="0 0 58 58"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            {...rest}
        >
            <path d="M53.0156 20.4023H55.7458V25.8448H53.0156V20.4023Z" fill="currentColor" />
            <path d="M50.2891 25.8398H53.0014V28.5522H50.2891V25.8398Z" fill="currentColor" />
            <path d="M47.5703 28.5508H50.2826V31.2631H47.5703V28.5508Z" fill="currentColor" />
            <path d="M47.5703 17.6875H52.995V20.3998H47.5703V17.6875Z" fill="currentColor" />
            <path d="M44.8594 20.4023H47.5895V23.1147H44.8594V20.4023Z" fill="currentColor" />
            <path d="M44.8594 14.957H47.5895V17.6872H44.8594V14.957Z" fill="currentColor" />
            <path d="M42.1328 31.2656H47.5753V33.9958H42.1328V31.2656Z" fill="currentColor" />
            <path d="M42.1328 23.1133H44.8451V25.8434H42.1328V23.1133Z" fill="currentColor" />
            <path d="M42.1328 12.2461H44.8451V14.9584H42.1328V12.2461Z" fill="currentColor" />
            <path d="M39.4375 25.8398H42.1498V31.2645H39.4375V25.8398Z" fill="currentColor" />
            <path d="M39.4375 9.51953H42.1498V12.2497H39.4375V9.51953Z" fill="currentColor" />
            <path d="M36.7031 23.1133H39.4333V25.8434H36.7031V23.1133Z" fill="currentColor" />
            <path d="M36.7031 6.80078H39.4333V9.51311H36.7031V6.80078Z" fill="currentColor" />
            <path d="M33.9766 25.8398H36.6889V28.5522H33.9766V25.8398Z" fill="currentColor" />
            <path d="M33.9766 4.08984H36.6889V6.80217H33.9766V4.08984Z" fill="currentColor" />
            <path
                d="M31.2507 25.8434H28.5384V23.1133H25.826V25.8434H23.0959V28.5558H25.826V31.2681H23.0959V33.9983H20.3836V36.7106H17.6712V33.9983H14.9411V36.7106H12.2287V39.4408H9.49857V42.1531H6.78624V44.8654H4.07392V47.5956H1.34375V53.0381H4.07392V55.7504H9.49857V53.0381H12.2287V50.3079H14.9411V47.5956H17.6712V44.8654H20.3836V42.1531H23.0959V39.4408H25.826V36.7106H28.5384V33.9983H31.2507V31.2681H33.9809V28.5558H31.2507V25.8434Z"
                fill="currentColor"
            />
            <path d="M28.5391 17.6875H31.2514V23.1121H28.5391V17.6875Z" fill="currentColor" />
            <path d="M25.8203 1.36328H33.9751V4.09345H25.8203V1.36328Z" fill="currentColor" />
            <path d="M25.8203 14.957H28.5326V17.6872H25.8203V14.957Z" fill="currentColor" />
            <path d="M20.3906 12.2461H25.8331V14.9584H20.3906V12.2461Z" fill="currentColor" />
            <path d="M20.3906 4.08984H25.8331V6.80217H20.3906V4.08984Z" fill="currentColor" />
            <path d="M20.3906 28.5508H23.1029V31.2631H20.3906V28.5508Z" fill="currentColor" />
            <path d="M17.6641 31.2656H20.3764V33.9958H17.6641V31.2656Z" fill="currentColor" />
            <path d="M17.6641 14.957H20.3764V17.6872H17.6641V14.957Z" fill="currentColor" />
            <path d="M17.6641 6.80078H20.3764V9.51311H17.6641V6.80078Z" fill="currentColor" />
            <path d="M14.9297 9.51953H17.6599V14.962H14.9297V9.51953Z" fill="currentColor" />
        </svg>
    )
}
