import { useFrame } from "@react-three/fiber"
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
import { webglTeleport } from "@/registry/base/webgl-portal/webgl-portal"
import { WebglProvider } from "@/registry/base/webgl-provider/webgl-provider"

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
        <mesh renderOrder={5} scale={2} ref={ref}>
            <sphereGeometry args={[1, 10, 10]} />
            <meshBasicMaterial
                color={resolvedTheme === "dark" ? "#DFDFDF" : "#0E0E0E"}
                transparent={true}
            />
        </mesh>
    )
}

export default function LandingPreview() {
    return (
        <MotionCard
            className="max-w-5xl bg-transparent w-full mx-auto mt-12"
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
            <WebglProvider contained>
                <div
                    aria-label="Live preview of the Fluid Distortion shader effect"
                    role="img"
                    className="flex relative flex-col items-center justify-center h-150"
                >
                    <div className="absolute bg-bg inset-0 z-[-1] pattern-line"></div>

                    <p className="sr-only">
                        Interactive live preview of the Fluid Distortion shader, an Atelier UI
                        component built with React Three Fiber.
                    </p>

                    <FluidDistortion />
                    <webglTeleport.In>
                        <RotatingCube />
                    </webglTeleport.In>
                </div>
            </WebglProvider>
        </MotionCard>
    )
}
