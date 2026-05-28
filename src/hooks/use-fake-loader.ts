import { type ComponentRef, useEffect, useRef, useState } from "react"

const CONTENT = ["10%", "30%", "60%", "90%", "100%"] as const

type UseFakeLoaderOptions = {
    duration?: number
    content?: readonly string[]
}

export function useFakeLoader({ duration = 1000, content = CONTENT }: UseFakeLoaderOptions = {}) {
    const [loaded, setLoaded] = useState(false)
    const messageRef = useRef<ComponentRef<"span">>(null)

    useEffect(() => {
        let index = 0
        const interval = setInterval(() => {
            if (messageRef.current) messageRef.current.textContent = `${content[index]}`
            index++
            if (index >= content.length) {
                clearInterval(interval)
                setLoaded(true)
            }
        }, duration / content.length)

        return () => clearInterval(interval)
    }, [duration, content])

    return { loaded, messageRef }
}
