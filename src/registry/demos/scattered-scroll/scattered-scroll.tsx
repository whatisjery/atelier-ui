import { type LenisRef, ReactLenis } from "lenis/react"
import { cancelFrame, type FrameData, frame } from "motion"
import Image from "next/image"
import { type ComponentRef, useEffect, useRef } from "react"
import ScatteredScroll, {
    type ScatteredScrollProps,
} from "@/registry/base/scattered-scroll/scattered-scroll"

const IMAGE_URLS = [
    "/images/demo/shared/1.webp",
    "/images/demo/shared/2.webp",
    "/images/demo/shared/3.webp",
    "/images/demo/shared/4.webp",
]

export default function ScatteredScrollDemo(controls: Partial<ScatteredScrollProps>) {
    const scrollTargetRef = useRef<ComponentRef<"div">>(null)
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
            <div className="h-screen font-serif text-5xl flex w-full items-center justify-center">
                Scroll down
            </div>

            <section
                ref={scrollTargetRef}
                className="h-[500vh] -mt-[100vh] -mb-[100vh] relative font-serif text-5xl overflow-x-clip"
            >
                <div className="sticky top-0 h-screen gap-x-2 flex items-center justify-center">
                    <ScatteredScroll scrollTargetRef={scrollTargetRef} {...controls}>
                        {IMAGE_URLS.map((_, i) => (
                            <Image
                                key={i}
                                className="w-[30vw] aspect-[5/7] object-cover rounded-md"
                                src={IMAGE_URLS[i]}
                                alt="Image"
                                width={100}
                                height={100}
                            />
                        ))}
                    </ScatteredScroll>
                </div>
            </section>

            <div className="h-screen font-serif text-5xl flex w-full items-center justify-center">
                Scroll up
            </div>
        </ReactLenis>
    )
}
