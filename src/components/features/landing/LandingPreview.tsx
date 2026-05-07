import { Canvas, useFrame } from "@react-three/fiber"
import { EffectComposer } from "@react-three/postprocessing"
import { ExpandIcon, Lock, RotateCcw } from "lucide-react"
import { motion } from "motion/react"
import { useTheme } from "next-themes"
import { useRef } from "react"
import type { Mesh } from "three"
import ThemeSwitcher from "@/components/common/ThemeSwitcher"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import { env } from "@/env"
import { Link } from "@/i18n/navigation"
import { FluidDistortion } from "@/registry/base/fluid-distortion/fluid-distortion"

const MotionCard = motion.create(Card)

function RotatingCube() {
    const ref = useRef<Mesh>(null)

    const { resolvedTheme } = useTheme()

    useFrame(() => {
        if (ref.current) {
            ref.current.rotation.x += 0.005
            ref.current.rotation.y += 0.005
        }
    })

    return (
        <mesh scale={2} ref={ref}>
            <sphereGeometry args={[1, 10, 10]} />
            <meshBasicMaterial
                color={resolvedTheme === "dark" ? "#DFDFDF" : "#0E0E0E"}
                transparent={true}
            />
        </mesh>
    )
}

type LandingPreviewProps = {
    onWebGLReady: () => void
}

export default function LandingPreview({ onWebGLReady }: LandingPreviewProps) {
    return (
        <MotionCard
            className="max-w-5xl w-full mx-auto mt-12"
            headerSlot={
                <>
                    <div className="flex items-center gap-x-3 min-w-0 flex-1">
                        <ThemeSwitcher size="0.6rem" />

                        <div className="cursor-default min-w-0 max-w-60 flex-1 h-8 bg-accent-5 flex items-center gap-x-1 text-xs p-1 px-3 border rounded">
                            <Lock className="size-2.5 mr-1 text-accent-2 shrink-0" />

                            <span className="flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                                {`${env.NEXT_PUBLIC_SITE_URL}/fluid-distortion`}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-x-1 h-8">
                        <Button
                            asChild
                            aria-label="Expand preview"
                            aria-hidden="true"
                            size="icon"
                            variant="ghost"
                            className="h-full pointer-events-none select-none"
                        >
                            <div>
                                <ExpandIcon strokeWidth={1.5} className="size-4" />
                            </div>
                        </Button>

                        <span className="bg-border h-6 w-px flex" />

                        <Button
                            asChild
                            aria-hidden="true"
                            size="icon"
                            variant="ghost"
                            className="h-full pointer-events-none select-none"
                            aria-label="Refresh preview"
                        >
                            <div>
                                <RotateCcw strokeWidth={1.5} className="size-4" />
                            </div>
                        </Button>

                        <Button
                            asChild
                            variant="secondary"
                            className="px-4 h-full whitespace-nowrap text-xs"
                        >
                            <Link href="/docs/components/cursor/fluid-distortion">
                                View component
                            </Link>
                        </Button>
                    </div>
                </>
            }
        >
            <div
                aria-label="Live preview of the Fluid Distortion shader effect"
                role="img"
                className="flex relative flex-col items-center justify-center pattern-line  h-[600px]"
            >
                <p className="sr-only">
                    Interactive live preview of the Fluid Distortion shader, an Atelier UI component
                    built with React Three Fiber.
                </p>

                <Canvas
                    onCreated={async ({ gl, scene, camera }) => {
                        await gl.compileAsync(scene, camera)
                        onWebGLReady()
                    }}
                    style={{
                        width: "100%",
                        height: "100%",
                        position: "absolute",
                        top: 0,
                        left: 0,
                    }}
                >
                    <RotatingCube />

                    <EffectComposer>
                        <FluidDistortion />
                    </EffectComposer>
                </Canvas>
            </div>
        </MotionCard>
    )
}
