"use client"

import ReactLenis from "lenis/react"
import { motion, useScroll, useTransform } from "motion/react"
import { useTranslations } from "next-intl"
import { useEffect, useRef, useState } from "react"
import Footer from "@/components/common/Footer"
import MainNav from "@/components/common/MainNav"
import { IconMotion } from "@/components/icons/IconMotion"
import { IconPxHammer } from "@/components/icons/IconPxHammer"
import { IconReact } from "@/components/icons/IconReact"
import { IconTailwind } from "@/components/icons/IconTailwind"
import { IconThreeJs } from "@/components/icons/IconThreeJs"
import { IconTypeScript } from "@/components/icons/IconTypeScript"
import AnimatedArrow from "@/components/ui/AnimatedArrow"
import BarCode from "@/components/ui/BarCode"
import Border from "@/components/ui/Border"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import BackgroundPixelGrid from "@/components/ui/PixelGrid"
import ScrollingMarquee from "@/components/ui/ScrollingMarquee"
import { env } from "@/env"
import { useIsMobile } from "@/hooks/use-mobile"
import { Link } from "@/i18n/navigation"
import { DEFAULT_PIXEL_SIZE, VERSION } from "@/lib/constants"
import type { DocTree } from "@/types/docs"
import LandingClipReveal from "./LandingClipReveal"
import LandingGridScroll from "./LandingGridScroll"
import LandingPreloader from "./LandingPreloader"
import LandingPreview from "./LandingPreview"

const SIZE_MULTIPLIER = 2.7 as const

const CORNERS = [
    "border-t-1 border-l-1 md:border-t-2 md:border-l-2 top-0 left-0 ",
    "border-t-1 border-r-1 md:border-t-2 md:border-r-2 top-0 right-0 ",
    "border-b-1 border-l-1 md:border-b-2 md:border-l-2 bottom-0 left-0 ",
    "border-b-1 border-r-1 md:border-b-2 md:border-r-2 bottom-0 right-0 ",
] as const

const techIconData = [
    {
        icon: <IconMotion size={11 * SIZE_MULTIPLIER} />,
        title: "motion",
    },
    {
        icon: <IconReact size={8 * SIZE_MULTIPLIER} />,
        title: "react",
    },
    {
        icon: <IconThreeJs size={7 * SIZE_MULTIPLIER} />,
        title: "react-three-fiber",
    },
    {
        icon: <IconTailwind size={9 * SIZE_MULTIPLIER} />,
        title: "tailwindcss",
    },
    {
        icon: <IconTypeScript size={7 * SIZE_MULTIPLIER} />,
        title: "typescript",
    },
]

const MotionCard = motion.create(Card)
const MotionHammer = motion.create(IconPxHammer)

type PageLadingProps = {
    showcaseComponents: DocTree[]
}

export default function PageLanding({ showcaseComponents }: PageLadingProps) {
    const tMetadata = useTranslations("metadata")
    const [isSceneReady, setIsSceneReady] = useState(false)
    const [showLoader, setShowLoader] = useState(true)
    const bottomCardRef = useRef<HTMLDivElement>(null)
    const heroSectionRef = useRef<HTMLDivElement>(null)

    const isMobile = useIsMobile(640)

    const { scrollYProgress: heroProgress } = useScroll({
        target: heroSectionRef,
        offset: ["start start", "end start"],
    })
    const { scrollYProgress: cardProgress } = useScroll({
        target: bottomCardRef,
        offset: ["start end", "end -450px"],
    })

    const cardY = useTransform(cardProgress, [0, 1], [0, -300])
    const heroY = useTransform(heroProgress, [0, 1], [0, 700])

    useEffect(() => {
        if (!isSceneReady) return
        const t = setTimeout(() => setShowLoader(false), 800)
        return () => clearTimeout(t)
    }, [isSceneReady])

    return (
        <ReactLenis root options={{ syncTouch: true, lerp: 0.11, smoothWheel: !isMobile }}>
            <LandingPreloader isLoaded={!showLoader} />

            <MainNav className="max-w-[calc(var(--spacing-base-w)+100px)] mx-auto" />

            <BackgroundPixelGrid
                className="left-[calc(50%-50vw)] w-full h-210 top-nav-h -z-1"
                pixelSize={DEFAULT_PIXEL_SIZE}
            />

            <main className="w-full max-w-base-w mx-auto relative sm:px-3">
                <section className="sm:-mt-nav-h" ref={heroSectionRef}>
                    <motion.div
                        style={isMobile ? undefined : { y: heroY }}
                        className="flex flex-col items-center justify-center h-fit max-sm:-mb-50 sm:h-210 px-5 pt-10 sm:pt-130 relative"
                    >
                        <h1 className="flex flex-col items-center justify-center text-4xl xxs:text-5xl sm:text-6xl lg:text-7xl font-light mb-2">
                            <span className="flex items-center leading-[1.1em] sm:flex-row flex-col">
                                <span className="flex items-center sm:flex-row flex-col-reverse">
                                    <span className="tracking-[-0.03em]">Premium</span>

                                    <MotionHammer
                                        animate={{ rotate: [0, 15, 0, 15, 0] }}
                                        transition={{
                                            duration: 0.8,
                                            repeat: Infinity,
                                            ease: "anticipate",
                                            repeatDelay: 1,
                                        }}
                                        aria-hidden="true"
                                        className="size-15 mx-4 flex origin-bottom-left"
                                    />
                                </span>
                                <span className="font-serif italic">handcrafted</span>
                            </span>

                            <span className="relative inline-block bg-accent-5  pb-1.5">
                                {CORNERS.map((corner) => (
                                    <span
                                        key={corner}
                                        className={`absolute size-4 ${corner} border-current`}
                                        aria-hidden="true"
                                    />
                                ))}
                                <span className="px-2 tracking-[-0.03em]">web animations</span>
                            </span>
                        </h1>

                        <p className="max-w-2xl text-center font-medium my-2">
                            {tMetadata("description")}
                        </p>

                        <div className="flex items-center justify-center gap-2 my-2 w-full sm:flex-row flex-col">
                            <Button
                                size="big"
                                className="w-full sm:w-auto"
                                asChild
                                variant="secondary"
                            >
                                <a
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href={env.NEXT_PUBLIC_POLAR_CHECKOUT_URL}
                                >
                                    Pro access
                                    <AnimatedArrow />
                                </a>
                            </Button>

                            <Button
                                size="big"
                                className="w-full sm:w-auto"
                                asChild
                                variant="dashed"
                            >
                                <Link href="/docs">
                                    Read docs
                                    <AnimatedArrow />
                                </Link>
                            </Button>
                        </div>

                        <LandingPreview onWebGLReady={() => setIsSceneReady(true)} />
                    </motion.div>

                    <div className="relative py-6 bg-bg border-r border-l h-20">
                        <div className="absolute mt-px h-full -z-1 bg-bg top-0 w-screen left-[calc(50%-50vw)]" />
                        <Border direction="horizontal" className="top-0" />
                        <Border direction="horizontal" className="bottom-0" />

                        <ScrollingMarquee fadeOnEachSide>
                            {techIconData.map(({ icon, title }) => (
                                <div
                                    key={title}
                                    title={title}
                                    className="flex h-full items-center justify-center gap-2 shrink-0 mr-10"
                                >
                                    <span>{icon}</span>
                                    <span className="text-xl font-thin whitespace-nowrap">
                                        {title}
                                    </span>
                                </div>
                            ))}
                        </ScrollingMarquee>
                        <Border direction="horizontal" className="bottom-0" />
                    </div>

                    <LandingClipReveal />
                </section>

                <LandingGridScroll items={showcaseComponents} />

                <section className="flex px-5 flex-col justify-between items-center h-220 pb-20 relative border-r border-l">
                    <MotionCard
                        ref={bottomCardRef}
                        style={isMobile ? undefined : { y: cardY }}
                        className="w-full max-w-5xl max-sm:-mt-30  h-[300px] rounded-md overflow-hidden flex flex-col justify-between"
                    >
                        <div className="w-full h-full relative pattern-line"></div>
                        <div className="w-full font-medium text-sm h-15 bg-bg border-t flex items-center justify-center">
                            {VERSION} &nbsp; Work in progress
                        </div>
                    </MotionCard>

                    <div className="w-fit flex-col flex items-center justify-center">
                        <BarCode size={170} />
                        <small className='before:content-["***"] after:content-["***"] flex text-[0.7rem] font-mono uppercase tracking-wider items-center'>
                            assembled with care
                        </small>
                    </div>

                    <Border direction="vertical" className="-left-px -bottom-15 h-15" />
                    <Border direction="vertical" className="-right-px -bottom-15 h-15" />
                </section>
            </main>

            <Footer />
        </ReactLenis>
    )
}
