import "./text-roll.css"
import { type ComponentRef, useCallback, useEffect, useImperativeHandle, useRef } from "react"
import { TextSplit } from "../text-split/text-split"

type AnimationProps = {
    axis: "x" | "y"
    direction: "forward" | "backward" | "random"
    stagger: number
    duration: number
    cycles: number
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
} & AnimationProps

export type DisplaceLetterHandle = {
    play: () => void
}

function getDir(dir: TextRollProps["direction"]) {
    if (dir === "random") return Math.random() > 0.5 ? "-1" : "1"
    if (dir === "forward") return "1"
    return "-1"
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
}: DisplaceLetterProps) {
    const wrapperRef = useRef<ComponentRef<"span">>(null)
    const isPlayingRef = useRef(false)

    const startPlay = useCallback(() => {
        const el = wrapperRef.current
        if (!el) return
        if (isPlayingRef.current) return
        isPlayingRef.current = true
        el.style.setProperty("--aui-roll-dir", getDir(direction))
        el.dataset.auiRollPlaying = "true"
    }, [direction])

    useImperativeHandle(ref, () => ({ play: startPlay }), [startPlay])

    const handleAnimationEnd = (e: React.AnimationEvent) => {
        if (e.animationName !== "aui-keyframes-slide") return
        wrapperRef.current?.removeAttribute("data-aui-roll-playing")
        isPlayingRef.current = false
    }

    return (
        <span
            ref={wrapperRef}
            suppressHydrationWarning
            onMouseEnter={enableHover ? startPlay : undefined}
            onAnimationEnd={handleAnimationEnd}
            className="overflow-clip inline-block relative whitespace-pre"
            data-aui-roll-letter={true}
            data-aui-roll-axis={axis}
            style={
                {
                    "--aui-roll-dur": `${duration}s`,
                    "--aui-roll-delay": `${stagger * index}s`,
                    "--aui-roll-cycles": cycles,
                } as React.CSSProperties
            }
        >
            {Array.from({ length: cycles }, (_, i) => (
                <span
                    key={i}
                    aria-hidden={true}
                    className="absolute"
                    data-aui-roll-clone={true}
                    style={{ "--aui-roll-clone-step": i + 1 } as React.CSSProperties}
                >
                    {char}
                </span>
            ))}

            <span className="block" data-aui-roll-real={true}>
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
}: TextRollProps) {
    const containerRef = useRef<ComponentRef<"span">>(null)
    const letterRefs = useRef<(DisplaceLetterHandle | null)[]>([])
    const isPlayingRef = useRef(false)
    const accumulatedEndsRef = useRef(0)

    const triggerPlay = useCallback(() => {
        if (isPlayingRef.current) return
        isPlayingRef.current = true
        for (const letter of letterRefs.current) {
            letter?.play()
        }
    }, [])

    const handleGroupAnimationEnd = (e: React.AnimationEvent) => {
        if (e.animationName !== "aui-keyframes-slide") return
        accumulatedEndsRef.current++
        const expected = letterRefs.current.length * (cycles + 1)
        if (accumulatedEndsRef.current >= expected) {
            isPlayingRef.current = false
            accumulatedEndsRef.current = 0
        }
    }

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
            onAnimationEnd={handleGroupAnimationEnd}
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
                    />
                )}
            >
                {children}
            </TextSplit>
        </span>
    )
}
