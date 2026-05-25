"use client"

import { useParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { collages } from "@/registry/collage"
import { demos } from "@/registry/demos"
import type { ControlValue } from "@/types/controls"

const registry = { ...demos, ...collages }

type Values = Record<string, ControlValue>

export default function PreviewPage() {
    const { name } = useParams<{ name: string }>()
    const [values, setValues] = useState<Values>({})
    const Demo = registry[name]

    useEffect(() => {
        function handleMessage(event: MessageEvent) {
            if (event.origin !== window.location.origin) return
            if (!event.data || event.data.type !== "atelier:controls") return
            setValues(event.data.values)
        }

        window.addEventListener("message", handleMessage)

        if (window.parent !== window) {
            window.parent.postMessage({ type: "atelier:ready" }, window.location.origin)
        }

        return () => window.removeEventListener("message", handleMessage)
    }, [])

    if (!Demo) return null

    return (
        <>
            <div
                aria-hidden={true}
                className="pointer-events-none user-select-none -z-1 fixed inset-0 w-full h-full pattern-line opacity-60"
            />

            <Suspense fallback={null}>
                <Demo {...values} />
            </Suspense>
        </>
    )
}
