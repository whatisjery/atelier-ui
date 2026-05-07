import { type LenisRef, ReactLenis } from "lenis/react"
import { cancelFrame, type FrameData, frame } from "motion"
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
    const { speed = 3, ...restControls } = controls
    const lenisRef = useRef<LenisRef>(null)

    useEffect(() => {
        function update(data: FrameData) {
            const ref = lenisRef.current
            if (ref?.lenis) ref.lenis.raf(data.timestamp)
        }
        frame.update(update, true)
        return () => cancelFrame(update)
    }, [])

    return (
        <ReactLenis root ref={lenisRef} options={{ autoRaf: false, syncTouch: true }}>
            <div className="h-screen font-serif text-5xl flex items-center justify-center">
                Scroll down
            </div>

            <div className="h-screen bg-bg flex overflow-hidden gap-2">
                <InfiniteParallax {...restControls} speed={speed * 0.4} className="gap-2">
                    {IMAGE_URLS.map((url) => (
                        <div key={url} className="aspect-[5/7] relative overflow-hidden">
                            <Image sizes="33vw" src={url} alt={url} fill className="object-cover" />
                        </div>
                    ))}
                </InfiniteParallax>

                <InfiniteParallax {...restControls} speed={speed * 0.2} className="gap-2">
                    {IMAGE_URLS.map((url) => (
                        <div key={url} className="aspect-[5/7] relative overflow-hidden">
                            <Image sizes="33vw" src={url} alt={url} fill className="object-cover" />
                        </div>
                    ))}
                </InfiniteParallax>

                <InfiniteParallax {...restControls} speed={speed * 0.4} className="gap-2">
                    {IMAGE_URLS.map((url) => (
                        <div key={url} className="aspect-[5/7] relative overflow-hidden">
                            <Image sizes="33vw" src={url} alt={url} fill className="object-cover" />
                        </div>
                    ))}
                </InfiniteParallax>
            </div>

            <div className="h-screen font-serif text-5xl flex items-center justify-center">
                Scroll up
            </div>
        </ReactLenis>
    )
}
