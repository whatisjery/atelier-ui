import { type LenisRef, ReactLenis } from "lenis/react"
import { cancelFrame, type FrameData, frame } from "motion"
import { useEffect, useRef } from "react"
import {
    InfiniteParallax,
    type InfiniteParallaxProps,
} from "@/registry/base/infinite-parallax/infinite-parallax"

const IMAGE_URLS = [
    "/images/demo/shared/1.webp",
    "/images/demo/shared/2.webp",
    "/images/demo/shared/3.webp",
    "/images/demo/shared/4.webp",
]

export default function InfiniteParallaxDemo(controls: Partial<InfiniteParallaxProps>) {
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
                <InfiniteParallax {...controls}>
                    {IMAGE_URLS.map((url) => (
                        <img
                            width={100}
                            height={100}
                            key={url}
                            src={url}
                            alt={url}
                            className="aspect-5/7 w-full mb-2"
                        />
                    ))}
                </InfiniteParallax>

                <InfiniteParallax {...controls} reversed>
                    {IMAGE_URLS.map((url) => (
                        <img
                            width={100}
                            height={100}
                            key={url}
                            src={url}
                            alt={url}
                            className="aspect-5/7 w-full mb-2"
                        />
                    ))}
                </InfiniteParallax>

                <InfiniteParallax {...controls}>
                    {IMAGE_URLS.map((url) => (
                        <img
                            width={100}
                            height={100}
                            key={url}
                            src={url}
                            alt={url}
                            className="aspect-5/7 w-full mb-2"
                        />
                    ))}
                </InfiniteParallax>
            </div>

            <div className="h-screen font-serif text-5xl flex items-center justify-center">
                Scroll up
            </div>
        </ReactLenis>
    )
}
