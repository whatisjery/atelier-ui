import { animate, cubicBezier, useMotionValue } from "motion/react"
import { useEffect } from "react"
import { TextFluid, type TextFluidProps } from "@/registry/base/text-fluid/text-fluid"

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
        <div className="text-center demo-text flex items-center justify-center h-screen w-screen flex-col space-y-2">
            <span>
                This is a{" "}
                <TextFluid
                    render={
                        <span
                            className="cursor-default"
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
                    fluid
                </TextFluid>{" "}
                text effect!
            </span>

            <span>Try to interact with it.</span>
        </div>
    )
}
