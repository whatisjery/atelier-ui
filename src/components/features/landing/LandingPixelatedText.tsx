"use client"

import { useAnimationFrame } from "motion/react"
import { useId, useRef } from "react"
import { cn } from "@/lib/utils"

const TICK_SPEED = 200
const PIXEL_SIZES = [4, 6, 8, 10, 12, 3, 9]
const PALETTE = [
    "#ff3e3e",
    "#3eff8c",
    "#3e8cff",
    "#ff3edc",
    "#ffdc3e",
    "#3effe0",
    "#ff8c3e",
    "#c83eff",
]

function randomIndex(length: number, exclude: number) {
    const index = Math.floor(Math.random() * (length - 1))
    return index >= exclude ? index + 1 : index
}

export default function LandingPixelatedText({
    children,
    className,
}: {
    children: React.ReactNode
    className?: string
}) {
    const filterId = `px-${useId().replace(/:/g, "")}`
    const textRef = useRef<HTMLSpanElement>(null)
    const floodRef = useRef<SVGFEFloodElement>(null)
    const compositeRef = useRef<SVGFECompositeElement>(null)
    const morphRef = useRef<SVGFEMorphologyElement>(null)
    const last = useRef({ tick: 0, pixel: 0, color: 0 })

    useAnimationFrame((time) => {
        const el = textRef.current

        if (!el) return
        if (!floodRef.current) return
        if (!compositeRef.current) return
        if (!morphRef.current) return

        if (time - last.current.tick < TICK_SPEED) return
        last.current.tick = time

        const pixelIndex = randomIndex(PIXEL_SIZES.length, last.current.pixel)
        last.current.pixel = pixelIndex

        floodRef.current.setAttribute("x", String(PIXEL_SIZES[pixelIndex] / 2 - 1))
        floodRef.current.setAttribute("y", String(PIXEL_SIZES[pixelIndex] / 2 - 1))
        compositeRef.current.setAttribute("width", String(PIXEL_SIZES[pixelIndex]))
        compositeRef.current.setAttribute("height", String(PIXEL_SIZES[pixelIndex]))
        morphRef.current.setAttribute("radius", String(PIXEL_SIZES[pixelIndex] / 2))

        const colorIndex = randomIndex(PALETTE.length, last.current.color)
        last.current.color = colorIndex
        el.style.color = PALETTE[colorIndex]

        el.style.transform = `translate(${Math.random() * 3 - 1}px, ${Math.random() * 3 - 1}px)`
    })

    return (
        <span className={cn(className, "relative inline-block")}>
            <svg role="presentation" width="0" height="0" className="relative" aria-hidden>
                <filter id={filterId} x="0%" y="0%" width="100%" height="100%">
                    <feFlood ref={floodRef} x="4" y="4" height="2" width="2" />
                    <feComposite ref={compositeRef} width="10" height="10" />
                    <feTile result="a" />
                    <feComposite in="SourceGraphic" in2="a" operator="in" />
                    <feMorphology ref={morphRef} operator="dilate" radius="5" />
                </filter>
            </svg>

            <span ref={textRef} className="inline-block" style={{ filter: `url(#${filterId})` }}>
                {children}
            </span>
        </span>
    )
}
