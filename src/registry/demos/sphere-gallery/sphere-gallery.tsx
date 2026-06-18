import { AnimatePresence, motion } from "motion/react"
import { useTheme } from "next-themes"
import { useState } from "react"
import {
    SphereGallery,
    type SphereGalleryProps,
} from "@/registry/base/sphere-gallery/sphere-gallery"

const BASE_ITEMS = [
    { img: 1, credit: "https://www.cosmos.so/e/17756802" },
    { img: 2, credit: "https://www.cosmos.so/e/108831909" },
    { img: 3, credit: "https://www.cosmos.so/e/21166243" },
    { img: 4, credit: "https://www.cosmos.so/e/174672888" },
    { img: 5, credit: "https://www.cosmos.so/e/486842213" },
    { img: 6, credit: "https://www.cosmos.so/e/561750665" },
    { img: 7, credit: "https://www.cosmos.so/e/595454458" },
    { img: 8, credit: "https://www.cosmos.so/e/957041836" },
    { img: 9, credit: "https://www.cosmos.so/e/1301703474" },
    { img: 10, credit: "https://www.cosmos.so/e/1313669861" },
    { img: 11, credit: "https://www.cosmos.so/e/1561608022" },
    { img: 12, credit: "https://www.cosmos.so/e/1704730173" },
    { img: 13, credit: "https://www.cosmos.so/e/1897005460" },
    { img: 14, credit: "https://www.cosmos.so/e/1908995889" },
    { img: 15, credit: "https://www.cosmos.so/e/1946095704" },
    { img: 16, credit: "https://www.cosmos.so/e/2142048452" },
]

const ITEMS = BASE_ITEMS.map((item) => {
    return {
        src: `/images/demo/sphere/${item.img}.webp`,
        alt: `Image sphere gallery ${item.img}`,
        credit: item.credit,
    }
})

export default function SphereGalleryDemo({
    showTileColor = true,
    tileColor = "#F8F8F8",
    sphereColor = "#ffffff",
    ...controls
}: Partial<SphereGalleryProps> & { showTileColor?: boolean }) {
    const { resolvedTheme } = useTheme()

    const [activeIndex, setActiveIndex] = useState<number | null>(null)
    const _tileColor = resolvedTheme === "dark" ? "#4B4B4B" : tileColor
    const _sphereColor = resolvedTheme === "dark" ? "#000000" : sphereColor

    return (
        <>
            <div className="fixed inset-0 bg-bg -z-1" />

            <motion.h1
                initial={{ opacity: 0, filter: "blur(10px)" }}
                animate={{ opacity: activeIndex === null ? 1 : 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(10px)" }}
                transition={{
                    duration: 1,
                    ease: [0.2, 0.03, 0.26, 0.99],
                }}
                className="-translate-x-1/2 -translate-y-1/2 font-serif pointer-events-none fixed top-1/2 left-1/2 z-10 text-3xl text-white mix-blend-difference"
            >
                Sphere Gallery
            </motion.h1>

            <AnimatePresence mode="wait">
                {activeIndex && (
                    <motion.a
                        rel="noopener"
                        target="_blank"
                        href={ITEMS[activeIndex].credit}
                        key={ITEMS[activeIndex].credit}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                            duration: 0.4,
                            ease: [0.7, 0.03, 0.26, 0.99],
                        }}
                        className="-translate-x-1/2 -translate-y-1/2 fixed bottom-8 left-1/2 z-10 text-xs"
                    >
                        {ITEMS[activeIndex].credit}
                    </motion.a>
                )}
            </AnimatePresence>

            <SphereGallery
                items={ITEMS}
                onActiveChange={setActiveIndex}
                className="fixed inset-0 w-full h-full"
                tileColor={showTileColor ? _tileColor : null}
                sphereColor={_sphereColor}
                {...controls}
            />
        </>
    )
}
