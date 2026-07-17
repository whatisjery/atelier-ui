"use client"

import { motion, useInView, useScroll, useTransform } from "motion/react"
import { type ComponentRef, useEffect, useRef } from "react"
import videoManifest from "@/lib/video-manifest.json"

const DEFAULT_DASH = 4
const DEFAULT_GAP = 4

export default function LandingClipReveal() {
    const containerRef = useRef(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "start 90px"],
    })
    const opacity = useTransform(scrollYProgress, [0, 1], [0, 1])
    const size = useTransform(scrollYProgress, [0, 1], ["0%", "85%"])

    const videoRef = useRef<ComponentRef<"video">>(null)
    const videoInView = useInView(videoRef)

    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        if (!videoInView) {
            video.pause()
            return
        }

        video.currentTime = 0
        video.play().catch(() => {})
    }, [videoInView])

    return (
        <div ref={containerRef} className="w-full relative z-1 h-220">
            <div className="w-full h-full bg-bg pattern-line" />

            <motion.div
                style={{ width: size, height: size }}
                className="absolute will-change-contents top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg"
            >
                <div className="absolute inset-5 overflow-hidden">
                    <figure className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex w-max flex-col items-center gap-y-5">
                        <div className="w-[50rem] aspect-[720/460] overflow-hidden">
                            <video
                                ref={videoRef}
                                aria-label="Video preview of the Sphere Gallery component"
                                src={videoManifest["sphere-gallery"]}
                                poster={videoManifest["sphere-gallery"].replace(/\.mp4$/, ".webp")}
                                className="w-full object-cover scale-101"
                                muted
                                loop
                                playsInline
                                preload="auto"
                            />
                        </div>

                        <motion.figcaption
                            style={{ opacity }}
                            className="text-lg max-w-xl text-center"
                        >
                            Every component is and designed with care and every motion is judged by{" "}
                            <span className="font-medium text-accent-1 underline">
                                {" "}
                                a real human eye.
                            </span>
                        </motion.figcaption>
                    </figure>
                </div>

                <div className="flex absolute inset-0 z-2 justify-between w-full h-full">
                    <div className="flex flex-col justify-between h-full [&>div]:relative [&>div]:bg-theme-bg">
                        <div className="handle w-2.5 h-2.5 right-1 bottom-1 bg-bg border-theme-bg border" />
                        <div className="handle w-2.5 h-2.5 right-1 -bottom-1 bg-bg border-theme-bg border" />
                    </div>
                    <div className="flex flex-col justify-between h-full [&>div]:relative [&>div]:bg-theme-bg ">
                        <div className="handle w-2.5 h-2.5 -right-1 -top-1 bg-bg border-theme-bg border" />
                        <div className="handle w-2.5 h-2.5 -right-1 top-1 bg-bg border-theme-bg border" />
                    </div>
                </div>
                <svg
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                >
                    <rect
                        width="100"
                        height="100"
                        fill="none"
                        vectorEffect="non-scaling-stroke"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeDasharray={`${DEFAULT_DASH} ${DEFAULT_GAP}`}
                        className="text-accent-2"
                    >
                        <animate
                            attributeName="stroke-dashoffset"
                            values="0;-24"
                            dur="1s"
                            repeatCount="indefinite"
                        />
                    </rect>
                </svg>
            </motion.div>
        </div>
    )
}
