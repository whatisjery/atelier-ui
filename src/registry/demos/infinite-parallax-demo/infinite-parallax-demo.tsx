"use client"

import Lenis from "lenis"
import Image from "next/image"
import { useEffect, useRef } from "react"
import {
    InfiniteParallax,
    type ParallaxColumnProps,
} from "@/registry/base/infinite-parallax/infinite-parallax"

const IMAGE_URLS = [
    "/images/demo/shared/1.webp",
    "/images/demo/shared/2.webp",
    "/images/demo/shared/3.webp",
    "/images/demo/shared/4.webp",
]

export default function InfiniteParallaxDemo(controls: Partial<ParallaxColumnProps>) {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!containerRef.current) return

        const lenis = new Lenis({
            autoRaf: true,
            wrapper: containerRef.current,
            smoothWheel: true,
        })
        return () => lenis.destroy()
    }, [])

    return (
        <div ref={containerRef} className="absolute inset-0 overflow-auto not-prose">
            <div className="h-[530px] font-serif text-4xl flex items-center justify-center relative z-5">
                Scroll down
            </div>

            <div className="h-[530px] bg-mat-1 flex overflow-hidden gap-2">
                <InfiniteParallax
                    {...controls}
                    speed={controls.speed ? controls.speed * 0.4 : 0}
                    containerRef={containerRef}
                    className="gap-2"
                >
                    {IMAGE_URLS.map((url) => (
                        <div key={url} className="h-[200px] relative overflow-hidden">
                            <Image src={url} alt={url} fill className="object-cover" />
                        </div>
                    ))}
                </InfiniteParallax>

                <InfiniteParallax
                    {...controls}
                    speed={controls.speed ? controls.speed * 0.2 : 0}
                    containerRef={containerRef}
                    className="gap-2"
                >
                    {IMAGE_URLS.map((url) => (
                        <div key={url} className="h-[200px] relative overflow-hidden">
                            <Image src={url} alt={url} fill className="object-cover" />
                        </div>
                    ))}
                </InfiniteParallax>

                <InfiniteParallax
                    {...controls}
                    speed={controls.speed ? controls.speed * 0.4 : 0}
                    containerRef={containerRef}
                    className="gap-2"
                >
                    {IMAGE_URLS.map((url) => (
                        <div key={url} className="h-[200px] relative overflow-hidden">
                            <Image src={url} alt={url} fill className="object-cover" />
                        </div>
                    ))}
                </InfiniteParallax>
            </div>

            <div className="h-[530px] font-serif text-4xl flex items-center justify-center relative z-5">
                Scroll up
            </div>
        </div>
    )
}
