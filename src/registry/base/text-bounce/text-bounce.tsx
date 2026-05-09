import { animate } from "motion"
import type React from "react"
import { type ComponentRef, useRef } from "react"
import { TextSplit } from "../text-split/text-split"

export type TextBounceProps = {
    children: string
    pause?: number
    outDuration?: number
    inDuration?: number
    bounce?: number
    distance?: number
    rotation?: number
}

type LetterProps = {
    char: string
    pause: number
    outDuration: number
    inDuration: number
    bounce: number
    distance: number
    rotation: number
}

function Letter({ char, pause, outDuration, inDuration, bounce, distance, rotation }: LetterProps) {
    const ref = useRef<ComponentRef<"span">>(null)

    const handlePointerEnter = async (event: React.PointerEvent<HTMLSpanElement>) => {
        const el = ref.current
        if (!el) return

        const rect = el.getBoundingClientRect()

        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2
        const dx = cx - event.clientX
        const dy = cy - event.clientY
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        const nx = dx / dist
        const ny = dy / dist

        await animate([
            [
                el,
                { x: nx * distance, y: ny * distance, rotate: nx * rotation },
                { duration: outDuration, ease: "circOut" },
            ],
            [
                el,
                { x: 0, y: 0, rotate: 0 },
                { type: "spring", duration: inDuration, bounce, delay: pause },
            ],
        ])
    }

    return (
        <span
            ref={ref}
            className="inline-block will-change-transform whitespace-pre"
            onPointerEnter={handlePointerEnter}
        >
            {char}
        </span>
    )
}

export function TextBounce({
    children,
    pause = 0,
    outDuration = 0.35,
    inDuration = 0.8,
    bounce = 0.5,
    distance = 35,
    rotation = 25,
}: TextBounceProps) {
    return (
        <TextSplit
            showMask={false}
            splitBy="letters"
            renderItems={(char, index) => {
                return (
                    <Letter
                        key={index}
                        char={char}
                        pause={pause}
                        outDuration={outDuration}
                        inDuration={inDuration}
                        bounce={bounce}
                        distance={distance}
                        rotation={rotation}
                    />
                )
            }}
        >
            {children}
        </TextSplit>
    )
}
