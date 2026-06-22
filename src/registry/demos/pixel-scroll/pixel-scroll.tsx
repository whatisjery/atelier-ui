import { type LenisRef, ReactLenis, useLenis } from "lenis/react"
import { cancelFrame, type FrameData, frame } from "motion"
import { type ComponentRef, useEffect, useRef, useState } from "react"
import PixelScroll, { type PixelScrollProps } from "@/registry/base/pixel-scroll/pixel-scroll"

function ScrollLabel() {
    const [pastMiddle, setPastMiddle] = useState(false)
    useLenis(({ progress }) => setPastMiddle(progress >= 0.5))

    return (
        <div className="fixed inset-0 flex items-center justify-center text-5xl font-serif">
            {pastMiddle ? "Scroll up" : "Scroll down"}
        </div>
    )
}

export default function PixelScrollDemo(controls: Partial<PixelScrollProps>) {
    const lenisRef = useRef<LenisRef>(null)
    const scrollTargetRef = useRef<ComponentRef<"div">>(null)

    useEffect(() => {
        function update(data: FrameData) {
            lenisRef.current?.lenis?.raf(data.timestamp)
        }
        frame.update(update, true)
        return () => cancelFrame(update)
    }, [])

    return (
        <ReactLenis root ref={lenisRef} options={{ autoRaf: false, syncTouch: true }}>
            <ScrollLabel />

            <div ref={scrollTargetRef} className="relative h-[250vh]">
                <div className="sticky top-0 h-screen">
                    <PixelScroll
                        colors={["#FBBE3C", "#D3D3D3"]}
                        {...controls}
                        direction="sweep"
                        className="text-[#191d24] dark:text-[#191b21]"
                        scrollTargetRef={scrollTargetRef}
                    />
                </div>
            </div>
        </ReactLenis>
    )
}
