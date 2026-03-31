import { type HtmlHTMLAttributes, useCallback, useEffect, useRef } from "react"
import { useFrameLoop } from "@/registry/hooks/use-frame-loop"

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*"

type SimpleScrambleProps = {
    duration?: number
    playOnMount?: boolean
    playOnHover?: boolean
    as?: React.ElementType
} & HtmlHTMLAttributes<HTMLElement>

export function SimpleScramble({
    children,
    duration = 1,
    playOnMount = true,
    playOnHover = true,
    as,
    ...rest
}: SimpleScrambleProps) {
    // biome-ignore lint/suspicious/noExplicitAny: Polymorphic component
    const Tag = (as || "span") as any

    const text = typeof children === "string" ? children : ""

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
            else next += CHARS[Math.floor(Math.random() * CHARS.length)]
        }

        ref.current.textContent = next
    })

    return (
        <Tag
            ref={ref}
            onTouchStart={playOnHover ? play : undefined}
            onMouseEnter={playOnHover ? play : undefined}
            {...rest}
        >
            {text}
        </Tag>
    )
}
