"use client"

import { useProgress } from "@react-three/drei"
import { useParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { components } from "@/registry"
import { SmoothScroll } from "@/registry/base/smooth-scroll/smooth-scroll"
import { WebglProvider } from "@/registry/base/webgl-provider/webgl-provider"
import { demos, scrollDemos } from "@/registry/demos"
import type { ControlValue } from "@/types/controls"

const registry = demos

type Values = Record<string, ControlValue>

/*
 * Only for 'scrollable' demos when they need Lenis.
 * To avoid blocking the scroll for non-scrollable demos.
 */
function needsSmoothScroll(name: string): boolean {
    const meta = components.find((component) => component.name === name)
    const scrollDependent = Boolean(meta?.registryDependencies?.includes("smooth-scroll"))
    return scrollDemos.includes(name) || scrollDependent
}

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

    const scene = (
        <WebglProvider>
            <Demo {...values} />
        </WebglProvider>
    )

    return (
        <>
            <div
                aria-hidden={true}
                className="pointer-events-none user-select-none -z-1 fixed inset-0 w-full h-full opacity-60"
            />

            {needsSmoothScroll(name) ? <SmoothScroll>{scene}</SmoothScroll> : scene}
        </>
    )
}
