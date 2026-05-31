import { type ComponentRef, useEffect, useRef, useState } from "react"
import { LOADER_STEPS } from "@/lib/constants"

type UseFakeLoaderOptions = {
    duration?: number
    steps?: readonly number[]
}

export function useFakeLoader({ duration = 1000, steps = LOADER_STEPS }: UseFakeLoaderOptions = {}) {
    const [loaded, setLoaded] = useState(false)
    const messageRef = useRef<ComponentRef<"span">>(null)

    useEffect(() => {
        let index = 0
        const interval = setInterval(() => {
            if (messageRef.current) messageRef.current.textContent = `${steps[index]}%`
            index++
            if (index >= steps.length) {
                clearInterval(interval)
                setLoaded(true)
            }
        }, duration / steps.length)

        return () => clearInterval(interval)
    }, [duration, steps])

    return { loaded, messageRef }
}
