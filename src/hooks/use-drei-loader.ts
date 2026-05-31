import { useProgress } from "@react-three/drei"
import { type ComponentRef, useEffect, useRef, useState } from "react"
import { LOADER_STEPS } from "@/lib/constants"

function snapToStep(value: number) {
    let snapped = 0
    for (const step of LOADER_STEPS) {
        if (step <= value) snapped = step
    }
    return snapped
}

type UseDreiLoaderOptions = {
    speed?: number
}

export function useDreiLoader({ speed = 0.075 }: UseDreiLoaderOptions = {}) {
    const [loaded, setLoaded] = useState(false)
    const messageRef = useRef<ComponentRef<"span">>(null)
    const progress = useProgress((state) => state.progress)
    const progressRef = useRef(progress)

    useEffect(() => {
        progressRef.current = progress
    }, [progress])

    useEffect(() => {
        let frame = 0
        let displayed = 0

        function tick() {
            const target = progressRef.current

            displayed = Math.min(displayed + (target - displayed) * speed, target < 100 ? 99 : 100)

            if (target >= 100 && displayed > 99) displayed = 100

            if (messageRef.current) messageRef.current.textContent = `${snapToStep(displayed)}%`

            if (displayed >= 100) {
                setLoaded(true)
                return
            }

            frame = requestAnimationFrame(tick)
        }

        frame = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(frame)
    }, [speed])

    return { loaded, messageRef }
}
