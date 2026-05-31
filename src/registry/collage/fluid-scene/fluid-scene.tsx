import { Canvas } from "@react-three/fiber"
import { EffectComposer } from "@react-three/postprocessing"
import ReactLenis from "lenis/react"
import { motion, useScroll, useTransform } from "motion/react"
import { type ComponentRef, useRef, useState } from "react"
import { useDreiLoader } from "@/hooks/use-drei-loader"
import { FluidDistortion } from "@/registry/base/fluid-distortion/fluid-distortion"
import { InfiniteParallax } from "@/registry/base/infinite-parallax/infinite-parallax"
import { SweepExit } from "@/registry/base/sweep-exit/sweep-exit"
import { TextRoll } from "@/registry/base/text-roll/text-roll"
import { WebglImage } from "@/registry/base/webgl-image/webgl-image"
import { WebglPortal } from "@/registry/base/webgl-portal/webgl-portal"
import { WebglText } from "@/registry/base/webgl-text/webgl-text"

const IMAGE_URLS = [
    "/images/demo/shared/1.webp",
    "/images/demo/shared/2.webp",
    "/images/demo/shared/3.webp",
]

const DEMO_TEXT =
    "Lorem ipsum dolor sit amet consectetur adipisicing elit. Adipisci velit, sed quia non numquam eius modi tempora incidunt "

const PARALLAX_CFG = [
    { parallaxAmount: 3, reversed: true },
    { parallaxAmount: 1, reverseImages: true },
    { parallaxAmount: 3, reversed: true },
]

export default function FluidScene() {
    const footerRef = useRef<ComponentRef<"footer">>(null)
    const [preloader, setShowPreloader] = useState(true)
    const { loaded, messageRef } = useDreiLoader()

    const { scrollYProgress } = useScroll({
        target: footerRef,
        offset: ["start end", "end end"],
    })
    const yFooter = useTransform(scrollYProgress, [0, 1], ["-50%", "0%"])

    return (
        <>
            {preloader && (
                <SweepExit
                    trigger={loaded}
                    onComplete={() => setShowPreloader(false)}
                    backgroundSlot={
                        <img
                            src="/images/demo/shared/3.webp"
                            alt="loader"
                            className="absolute inset-0 h-full w-full object-cover"
                        />
                    }
                >
                    <div className="w-full h-full bg-[#000000] flex items-center justify-center font-serif text-[#ffffff]">
                        <span ref={messageRef} className="text-2xl tabular-nums" />
                    </div>
                </SweepExit>
            )}

            <Canvas
                dpr={[1, 1.5]}
                style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}
            >
                <WebglPortal />

                <EffectComposer>
                    <FluidDistortion />
                </EffectComposer>
            </Canvas>

            <ReactLenis root>
                <header className="inset-0 text-xs sm:text-[1.3vw] flex fixed flex-col justify-between z-20 p-4 text-[#ffffff] pointer-events-none">
                    <span className="flex justify-between w-full">
                        <span>atelier-ui.com</span>
                        <span>atelier-ui.com</span>
                        <span>atelier-ui.com</span>
                    </span>

                    <span className="flex justify-between w-full mb-18">
                        <span>+</span>
                        <span>+</span>
                        <span>+</span>
                    </span>

                    <span className="flex justify-between w-full">
                        <span>atelier-ui.com</span>
                        <span>atelier-ui.com</span>
                        <span>atelier-ui.com</span>
                    </span>
                </header>

                <section className="h-screen relative flex items-end w-full text-[#ffffff] px-5">
                    <WebglImage
                        alt="runner"
                        src="/images/demo/shared/1.webp"
                        className="object-cover h-full absolute inset-0 w-full"
                    />

                    <div className="flex flex-col items-center w-full">
                        <h1 className="flex w-full justify-center text-[17vw]/[1.3]">
                            <WebglText zIndex={1} render={<p className="tracking-[-0.05em]"></p>}>
                                Atelier
                            </WebglText>

                            <WebglText
                                zIndex={1}
                                render={<p className="font-serif italic tracking-[-0.03em]"></p>}
                            >
                                (Collage)
                            </WebglText>
                        </h1>

                        <p className="text-[1.2vw] uppercase max-w-[50%] text-center mb-10">
                            {DEMO_TEXT}
                        </p>
                    </div>
                </section>

                <section className="h-[180vh] bg-[black] flex overflow-hidden relative">
                    <div className="absolute inset-0 z-5 bg-[#0000009d] pointer-events-none" />

                    <div className="absolute inset-0 flex items-center justify-end z-20 py-50 flex-col">
                        <TextRoll
                            duration={1.2}
                            playOnScroll
                            cycles={2}
                            playOnMount={false}
                            render={
                                <p className="text-[10vw]/[1.1] text-[#ffffff] tracking-[-0.04em] font-medium" />
                            }
                        >
                            AUI / 26-27
                        </TextRoll>
                    </div>

                    <motion.div className="absolute inset-0 flex">
                        {PARALLAX_CFG.map(({ parallaxAmount, reversed, reverseImages }, i) => {
                            const urls = reverseImages ? [...IMAGE_URLS].reverse() : IMAGE_URLS
                            return (
                                <InfiniteParallax
                                    key={i}
                                    parallaxAmount={parallaxAmount}
                                    reversed={reversed}
                                >
                                    {urls.map((url) => (
                                        <img
                                            width={100}
                                            height={100}
                                            key={url}
                                            src={url}
                                            alt={url}
                                            className="aspect-2.5/2 w-full object-cover"
                                        />
                                    ))}
                                </InfiniteParallax>
                            )
                        })}
                    </motion.div>
                </section>

                <footer ref={footerRef} className="overflow-hidden">
                    <motion.div
                        style={{ y: yFooter }}
                        className="h-screen relative flex items-end w-full text-[#ffffff]"
                    >
                        <WebglImage
                            // parent is animated, so the plane must follow it each frame
                            autoReflow
                            alt="skateboarder"
                            src="/images/demo/shared/2.webp"
                            className="object-cover absolute h-full inset-0 w-full"
                        />
                        <div className="flex flex-col items-center w-full relative z-2 h-full">
                            <WebglImage
                                src="/images/demo/shared/barcode.png"
                                alt="barcode"
                                autoReflow
                                className="mt-auto w-[12%] mb-4"
                                zIndex={2}
                            />
                            <p className="text-[1.2vw] uppercase max-w-[50%] text-center">
                                {DEMO_TEXT}
                            </p>

                            <span className="flex justify-center w-full text-[17vw]/[1.3] mb-10 text-center">
                                <WebglText
                                    autoReflow
                                    zIndex={1}
                                    render={<p className="tracking-[-0.05em]"></p>}
                                >
                                    Atelier
                                </WebglText>

                                <WebglText
                                    autoReflow
                                    zIndex={1}
                                    render={
                                        <p className="font-serif italic tracking-[-0.03em]"></p>
                                    }
                                >
                                    (Collage)
                                </WebglText>
                            </span>
                        </div>
                    </motion.div>
                </footer>
            </ReactLenis>
        </>
    )
}
