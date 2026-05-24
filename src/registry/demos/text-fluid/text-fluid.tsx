import { Canvas } from "@react-three/fiber"
import { animate, cubicBezier, useMotionValue } from "motion/react"
import { useEffect } from "react"
import { TextFluid, type TextFluidProps } from "@/registry/base/text-fluid/text-fluid"
import { WebglPortal } from "@/registry/base/webgl-portal/webgl-portal"

const easing = cubicBezier(0.83, 0.01, 0.56, 1)

export default function TextFluidDemo(controls: Partial<TextFluidProps>) {
    const opacity = useMotionValue(0)
    const noise = useMotionValue(0)

    useEffect(() => {
        const noiseAnimated = animate(noise, [0.08, 0.002], { duration: 1.3, ease: easing })
        const opacityAnimated = animate(opacity, [0.1, 1], { duration: 1.3, ease: easing })
        return () => {
            noiseAnimated.stop()
            opacityAnimated.stop()
        }
    }, [opacity, noise])

    return (
        <>
            <Canvas style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
                <WebglPortal />
            </Canvas>

            <div className="font-serif xs:text-7xl text-center text-4xl flex flex-col items-center justify-center h-screen w-screen space-y-2">
                <span>
                    <TextFluid
                        render={
                            <span
                                className="cursor-pointer"
                                onPointerEnter={() => {
                                    animate(opacity, 0.5, { duration: 0.5, ease: "circOut" })
                                    animate(noise, 0.03, { duration: 0.5, ease: "circOut" })
                                }}
                                onPointerOut={() => {
                                    animate(opacity, 1, { duration: 1, ease: "circOut" })
                                    animate(noise, 0.002, { duration: 1, ease: "circOut" })
                                }}
                            />
                        }
                        opacity={() => opacity.get()}
                        amplitude={() => noise.get()}
                        {...controls}
                    >
                        Interactive
                    </TextFluid>{" "}
                    text
                </span>
                <span>shader effect</span>

                <span className="font-sans text-xs mt-5">
                    (Responsive and match your font style)
                </span>
            </div>
        </>
    )
}
