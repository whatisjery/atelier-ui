import { motion } from "motion/react"
import { useTheme } from "next-themes"
import { useState } from "react"
import {
    SphereGallery,
    type SphereGalleryProps,
} from "@/registry/base/sphere-gallery/sphere-gallery"

const ITEMS = Array.from({ length: 20 }, (_, index) => ({
    src: `/images/demo/shared/${index + 1}.webp`,
    alt: `Image sphere gallery ${index + 1}`,
}))

export default function SphereGalleryDemo({
    showTileColor = true,
    tileColor = "#F8F8F8",
    sphereColor = "#ffffff",
    ...controls
}: Partial<SphereGalleryProps> & { showTileColor?: boolean }) {
    const { resolvedTheme } = useTheme()
    const [activeIndex, setActiveIndex] = useState<number | null>(null)

    // Wait for the shaders to compile and textures to upload so the motion animation doesn't "stutter" when the sphere is revealed.
    const [webGlReady, setWebGlReady] = useState(false)

    const _tileColor = resolvedTheme === "dark" ? "#4B4B4B" : tileColor
    const _sphereColor = resolvedTheme === "dark" ? "#000000" : sphereColor

    return (
        <>
            <div className="fixed inset-0 bg-bg -z-1" />

            {webGlReady && (
                <motion.h1
                    initial={{ opacity: 0, filter: "blur(3px)" }}
                    animate={{ opacity: activeIndex === null ? 1 : 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, filter: "blur(3px)" }}
                    transition={{
                        duration: 0.8,
                        ease: [0.2, 0.03, 0.26, 0.99],
                    }}
                    className="-translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none fixed top-1/2 left-1/2 z-10 text-white mix-blend-difference"
                >
                    <span className="text-4xl font-serif mb-0.5">Orbit gallery</span>
                    <span className="text-sm text-accent-2 opacity-55">
                        Scroll or select a ring image
                    </span>
                </motion.h1>
            )}

            <SphereGallery
                items={ITEMS}
                onActiveChange={setActiveIndex}
                onReady={() => setWebGlReady(true)}
                className="fixed inset-0 w-full h-full"
                tileColor={showTileColor ? _tileColor : null}
                sphereColor={_sphereColor}
                {...controls}
            />
        </>
    )
}
