"use client"

import { useFakeLoader } from "@/hooks/use-fake-loader"
import { SweepExit, type SweepExitProps } from "@/registry/base/sweep-exit/sweep-exit"

export default function SweepExitDemo(controls: Partial<SweepExitProps>) {
    const { loaded, messageRef } = useFakeLoader()

    return (
        <div className="w-screen h-screen">
            <img
                src="/images/demo/shared/3.webp"
                alt="Hero"
                className="absolute inset-0 h-full w-full object-cover"
            />

            <span className="absolute inset-0 flex items-center justify-center font-serif text-white text-6xl">
                Atelier UI
            </span>

            <SweepExit
                key={JSON.stringify(controls)}
                {...controls}
                trigger={loaded}
                backgroundSlot={
                    <img
                        src="/images/demo/shared/1.webp"
                        alt="overlay"
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                }
            >
                <div className="w-full h-full font-serif text-white bg-black flex flex-col items-center justify-center">
                    <span ref={messageRef} className="text-2xl text-center" />
                </div>
            </SweepExit>
        </div>
    )
}
