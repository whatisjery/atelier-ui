import { motion } from "motion/react"
import { useState } from "react"
import { OrbitGallery, type OrbitGalleryProps } from "@/registry/base/orbit-gallery/orbit-gallery"

const ITEMS = Array.from({ length: 20 }, (_, index) => ({
    src: `/images/demo/shared/${index + 1}.webp`,
    alt: `Orbit gallery image ${index + 1}`,
}))

export default function OrbitGalleryDemo(controls: Partial<OrbitGalleryProps>) {
    const [webGlReady, setWebGlReady] = useState(false)

    return (
        <div className="h-screen">
            {webGlReady && (
                <motion.h1
                    initial={{ opacity: 0, filter: "blur(3px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    transition={{
                        duration: 0.8,
                        ease: [0.2, 0.03, 0.26, 0.99],
                    }}
                    className="fixed inset-0 flex flex-col items-center justify-center pointer-events-none -z-1"
                >
                    <span className="text-4xl font-serif mb-0.5">Orbit gallery</span>
                    <span className="text-sm text-accent-3">Scroll or select a ring image</span>
                </motion.h1>
            )}

            <OrbitGallery
                items={ITEMS}
                onReady={() => setWebGlReady(true)}
                className="fixed inset-0 w-full h-full"
                {...controls}
            />
        </div>
    )
}
