import { animate, type Easing } from "motion"
import { type ComponentRef, useCallback, useEffect, useImperativeHandle, useRef } from "react"
import { TextSplit } from "../text-split/text-split"

type AnimationProps = {
    axis: "x" | "y"
    direction: "forward" | "backward" | "random"
    stagger: number
    duration: number
    cycles: number
    ease: Easing
}

export type TextRollProps = {
    children: string
    mode?: "letters" | "group"
    playOnScroll?: boolean
    playOnMount?: boolean
    playOnHover?: boolean
} & Partial<AnimationProps>

type DisplaceLetterProps = {
    ref: React.Ref<DisplaceLetterHandle>
    char: string
    index: number
    enableHover: boolean
    onComplete?: () => void
} & AnimationProps

export type DisplaceLetterHandle = {
    play: () => void
}

function getDir(dir: TextRollProps["direction"]): 1 | -1 {
    if (dir === "random") return Math.random() > 0.5 ? 1 : -1
    if (dir === "forward") return 1
    return -1
}

function DisplaceLetter({
    ref,
    char,
    index,
    enableHover,
    axis,
    direction,
    stagger,
    duration,
    cycles,
    ease,
    onComplete,
}: DisplaceLetterProps) {
    const isPlayingRef = useRef(false)
    const clonedCharsRef = useRef<(ComponentRef<"span"> | null)[]>([])
    const currentCharRef = useRef<ComponentRef<"span"> | null>(null)

    const startPlay = useCallback(async () => {
        if (isPlayingRef.current) return
        isPlayingRef.current = true

        const dir = getDir(direction)

        clonedCharsRef.current.forEach((clone, i) => {
            if (!clone) return
            if (axis === "y") {
                clone.style.top = `${(i + 1) * dir * -100}%`
                clone.style.left = "0"
            } else {
                clone.style.left = `${(i + 1) * dir * -100}%`
                clone.style.top = "0"
            }
        })

        await animate(
            [currentCharRef.current, ...clonedCharsRef.current.filter((el) => el !== null)],
            axis === "y"
                ? { y: [`${dir * cycles * 100}%`, "0%"] }
                : { x: [`${dir * cycles * 100}%`, "0%"] },
            {
                duration,
                delay: stagger * index,
                ease,
            },
        )
        isPlayingRef.current = false
        onComplete?.()
    }, [axis, direction, stagger, duration, cycles, ease, index, onComplete])

    useImperativeHandle(ref, () => ({ play: startPlay }), [startPlay])

    return (
        <span
            suppressHydrationWarning
            onMouseEnter={enableHover ? startPlay : undefined}
            className="overflow-clip inline-block relative whitespace-pre"
        >
            {Array.from({ length: cycles }, (_, i) => (
                <span
                    key={i}
                    ref={(el) => {
                        clonedCharsRef.current[i] = el
                    }}
                    aria-hidden={true}
                    className="absolute"
                >
                    {char}
                </span>
            ))}

            <span ref={currentCharRef} className="block">
                {char}
            </span>
        </span>
    )
}

export function TextRoll({
    children,
    axis = "y",
    mode = "letters",
    direction = "random",
    playOnScroll = true,
    playOnMount = true,
    playOnHover = true,
    stagger = 0,
    duration = 0.8,
    cycles = 2,
    ease = [0.84, 0, 0.22, 1],
}: TextRollProps) {
    const containerRef = useRef<ComponentRef<"span">>(null)
    const letterRefs = useRef<(DisplaceLetterHandle | null)[]>([])
    const isPlayingRef = useRef(false)
    const completedRef = useRef(0)

    const handleLetterComplete = useCallback(() => {
        completedRef.current++
        if (completedRef.current >= letterRefs.current.length) {
            isPlayingRef.current = false
            completedRef.current = 0
        }
    }, [])

    const triggerPlay = useCallback(() => {
        if (isPlayingRef.current) return
        isPlayingRef.current = true
        completedRef.current = 0

        for (const letter of letterRefs.current) {
            letter?.play()
        }
    }, [])

    useEffect(() => {
        if (playOnMount) triggerPlay()
    }, [playOnMount, triggerPlay])

    useEffect(() => {
        if (!playOnScroll) return
        const el = containerRef.current
        if (!el) return
        let isFirstRender = true
        const obs = new IntersectionObserver(([entry]) => {
            if (isFirstRender) {
                isFirstRender = false
                return
            }
            if (entry.isIntersecting) triggerPlay()
        })
        obs.observe(el)
        return () => obs.disconnect()
    }, [playOnScroll, triggerPlay])

    return (
        <span
            ref={containerRef}
            onMouseEnter={playOnHover && mode === "group" ? triggerPlay : undefined}
        >
            <TextSplit
                showMask={false}
                splitBy="letters"
                renderItems={(char, index) => (
                    <DisplaceLetter
                        ref={(el) => {
                            letterRefs.current[index] = el
                        }}
                        char={char}
                        index={index}
                        enableHover={playOnHover && mode === "letters"}
                        direction={direction}
                        axis={axis}
                        stagger={stagger}
                        duration={duration}
                        cycles={cycles}
                        ease={ease}
                        onComplete={handleLetterComplete}
                    />
                )}
            >
                {children}
            </TextSplit>
        </span>
    )
}
