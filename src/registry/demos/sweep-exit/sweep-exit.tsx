"use client"

import Image from "next/image"
import { useState } from "react"
import Button from "@/components/ui/Button"
import { useFakeLoader } from "@/hooks/use-fake-loader"
import { SweepExit, type SweepExitProps } from "@/registry/base/sweep-exit/sweep-exit"

export default function SweepExitDemo(controls: Partial<SweepExitProps>) {
    const [showOverlay, setShowOverlay] = useState(true)
    const { loaded, messageRef } = useFakeLoader()

    return (
        <div className="relative w-full h-screen">
            <Image
                src="/images/demo/shared/3.webp"
                alt="Hero"
                fill
                className="object-cover"
                priority
            />

            <div className="absolute inset-0 flex items-center justify-center flex-col">
                <Button
                    variant="ghost"
                    onClick={() => window.location.reload()}
                    className="font-serif text-white text-6xl h-auto px-0"
                >
                    Replay
                </Button>
            </div>

            {showOverlay && (
                <SweepExit
                    {...controls}
                    trigger={loaded}
                    onComplete={() => setShowOverlay(false)}
                    backgroundSlot={
                        <Image
                            src="/images/demo/shared/1.webp"
                            alt="overlay"
                            fill
                            className="object-cover"
                            priority
                        />
                    }
                >
                    <div className="w-full h-full font-serif text-white bg-black flex flex-col items-center justify-center">
                        <span ref={messageRef} className="text-2xl text-center" />
                    </div>
                </SweepExit>
            )}
        </div>
    )
}
