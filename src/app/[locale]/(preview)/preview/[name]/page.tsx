"use client"

import { useProgress } from "@react-three/drei"
import { useParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { WebglProvider } from "@/registry/base/webgl-provider/webgl-provider"
import { collages } from "@/registry/collage"
import { demos } from "@/registry/demos"
import type { ControlValue } from "@/types/controls"

const registry = { ...demos, ...collages }

type Values = Record<string, ControlValue>

export default function PreviewPage() {
    const { name } = useParams<{ name: string }>()
    const { active } = useProgress()
    const [values, setValues] = useState<Values>({})
    const hasSentReady = useRef(false)

    const Demo = registry[name]

    useEffect(() => {
        if (hasSentReady.current || window.parent === window) return
        if (active) return

        hasSentReady.current = true
        window.parent.postMessage({ type: "atelier:ready" }, window.location.origin)
    }, [active])

    useEffect(() => {
        function handleMessage(event: MessageEvent) {
            if (event.origin !== window.location.origin) return
            if (!event.data || event.data.type !== "atelier:controls") return
            setValues(event.data.values)
        }

        window.addEventListener("message", handleMessage)

        return () => window.removeEventListener("message", handleMessage)
    }, [])

    if (!Demo) return null

    return (
        <>
            <div
                aria-hidden={true}
                className="pointer-events-none user-select-none -z-1 fixed inset-0 w-full h-full pattern-line opacity-60"
            />

            <WebglProvider>
                <Demo {...values} />
            </WebglProvider>
        </>
    )
}
