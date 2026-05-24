import { useCallback, useEffect, useRef } from "react"
import { useFrameLoop } from "../../hooks/use-frame-loop"
import { type RenderProp, useRender } from "../../hooks/use-render"

export type TextScrambleProps = {
    children: string
    duration?: number
    playOnMount?: boolean
    playOnHover?: boolean
    characters?: string
    render?: RenderProp
}

export function TextScramble({
    children,
    duration = 1,
    playOnMount = true,
    playOnHover = true,
    characters = "abcdefghijklmnopqrstuvwxyz@!#*$%^&+_[]",
    render,
}: TextScrambleProps) {
    const text = children

    const ref = useRef<HTMLElement>(null)
    const startTime = useRef(0)
    const isAnimating = useRef(false)

    const play = useCallback(() => {
        startTime.current = 0
        isAnimating.current = true
    }, [])

    useEffect(() => {
        if (playOnMount) play()
    }, [text, playOnMount, play])

    useFrameLoop((time) => {
        if (!isAnimating.current) return
        if (!ref.current) return
        if (!startTime.current) startTime.current = time

        const elapsed = time - startTime.current
        const resolved = Math.floor((elapsed / duration) * text.length)

        if (resolved >= text.length) {
            ref.current.textContent = text
            isAnimating.current = false
            return
        }

        let next = ""
        for (let i = 0; i < text.length; i++) {
            if (i < resolved) next += text[i]
            else if (text[i] === " ") next += " "
            else next += characters[Math.floor(Math.random() * characters.length)]
        }

        ref.current.textContent = next
    })

    return useRender({
        render,
        defaultElement: <span />,
        props: {
            ref,
            onTouchStart: playOnHover ? play : undefined,
            onMouseEnter: playOnHover ? play : undefined,
            children: text,
        },
    })
}
