"use client"

import { ArrowDown } from "lucide-react"
import { motion, useScroll, useTransform } from "motion/react"
import { useTranslations } from "next-intl"
import { type ComponentRef, useEffect, useRef, useState } from "react"
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
import { useIsMobile } from "@/hooks/use-mobile"
import { Link } from "@/i18n/navigation"
import { DEFAULT_PIXEL_SIZE, REPO_URL } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { SmoothScroll } from "@/registry/base/smooth-scroll/smooth-scroll"
import type { DocTree } from "@/types/docs"
import LandingClipReveal from "./LandingClipReveal"
import LandingFeatureCards from "./LandingFeatureCards"
import LandingGridScroll from "./LandingGridScroll"
import LandingPaymentCards from "./LandingPaymentCards"
import LandingPreloader from "./LandingPreloader"
import LandingPreview from "./LandingPreview"

// import LandingRibbon from "./LandingRibbon"

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

type PageLadingProps = {
    showcaseComponents: DocTree[]
    newDocs?: DocTree[]
    ctaSlot?: React.ReactNode
    checkoutHref?: string
    proCtaSlot?: React.ReactNode
}

export default function PageLanding({
    showcaseComponents,
    newDocs = [],
    ctaSlot,
    checkoutHref,
    proCtaSlot,
}: PageLadingProps) {
    const tMetadata = useTranslations("metadata")
    const [showLoader, setShowLoader] = useState(true)
    const bottomCardRef = useRef<ComponentRef<"div">>(null)
    const heroSectionRef = useRef<ComponentRef<"div">>(null)

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
    const heroY = useTransform(heroProgress, [0, 1], [0, 600])

    useEffect(() => {
        const t = setTimeout(() => setShowLoader(false), 800)
        return () => clearTimeout(t)
    }, [])

    return (
        <SmoothScroll options={{ lerp: 0.11, smoothWheel: !isMobile, syncTouch: false }}>
            <LandingPreloader isLoaded={!showLoader} />

            {/* {newDocs.length > 0 && <LandingRibbon items={newDocs} />} */}

            <MainNav className="max-w-[calc(var(--spacing-landing-w)+100px)] mx-auto" />

            <BackgroundPixelGrid
                className="left-[calc(50%-50vw)] w-full h-210 top-nav-h -z-1"
                pixelSize={DEFAULT_PIXEL_SIZE}
            />

            <main className="w-full max-w-landing-w mx-auto relative sm:px-3">
                <section
                    ref={heroSectionRef}
                    className={cn({
                        "sm:-mt-nav-h": newDocs.length === 0,
                        "sm:-mt-[calc(var(--spacing-nav-h)+var(--spacing-ribbon-h))]":
                            newDocs.length > 0,
                    })}
                >
                    <motion.div
                        style={{ y: heroY }}
                        className="max-sm:transform-none! flex flex-col items-center justify-center h-fit max-sm:-mb-100 sm:h-220 px-5 pt-10 sm:pt-140 relative"
                    >
                        <h1 className="flex flex-col items-center justify-center text-4xl xxs:text-5xl sm:text-6xl lg:text-7xl font-light mb-2">
                            <span className="flex items-center leading-[1.1em] sm:flex-row flex-col">
                                <span className="flex items-center sm:flex-row flex-col-reverse">
                                    <span className="tracking-[-0.03em]">Premium</span>

                                    <IconPxHammer
                                        aria-hidden="true"
                                        className="size-17 ml-3 mr-2 relative bottom-2 flex origin-bottom-left a-hammer-tap"
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
                                <span className="px-2 tracking-[-0.03em] whitespace-nowrap">
                                    React animations
                                </span>
                            </span>
                        </h1>

                        <p className="max-w-2xl text-center my-2 text-lg">
                            {tMetadata("description")}
                        </p>

                        <div className="flex items-center justify-center gap-2 my-2 w-full sm:flex-row flex-col">
                            {ctaSlot ?? (
                                <Button
                                    size="big"
                                    className="w-full sm:w-auto"
                                    asChild
                                    variant="secondary"
                                >
                                    <a target="_blank" rel="noopener noreferrer" href={REPO_URL}>
                                        Star on GitHub
                                        <AnimatedArrow />
                                    </a>
                                </Button>
                            )}

                            <Button
                                size="big"
                                className="w-full sm:w-auto"
                                asChild
                                variant="dashed"
                            >
                                <Link href="/catalog">
                                    Browse catalog
                                    <AnimatedArrow />
                                </Link>
                            </Button>
                        </div>

                        <LandingPreview />
                    </motion.div>
                </section>

                <div className="relative border-x">
                    <div className="relative py-6 bg-bg h-20">
                        <Border direction="vertical" className="-left-px h-10 -top-10" />
                        <Border direction="vertical" className="-right-px h-10 -top-10" />
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
                    <LandingGridScroll items={showcaseComponents} />

                    <div className="relative h-0">
                        <MotionCard
                            ref={bottomCardRef}
                            aria-hidden="true"
                            style={isMobile ? undefined : { y: cardY }}
                            className="absolute top-0 left-5 right-5 mx-auto max-w-5xl -mt-2 h-28 md:h-60 rounded-md overflow-hidden flex flex-col justify-between pointer-events-none"
                        >
                            <div className="w-full h-full relative pattern-line" />
                            <div className="w-full h-15 bg-bg border-t" />
                        </MotionCard>
                    </div>

                    <section>
                        <div className="px-3 md:pb-25 pt-40 md:pt-50 text-center w-full relative">
                            <p className="text-xs text-accent-2 uppercase mb-5">unslop your app.</p>

                            <h2 className="flex flex-col items-center text-center text-4xl xxs:text-5xl sm:text-6xl lg:text-7xl font-light">
                                <span className="tracking-[-0.05em] mb-1">
                                    AI offers you speed,
                                </span>
                                <span className="font-serif italic tracking-normal">
                                    Atelier brings taste.
                                </span>
                            </h2>

                            <p className="text-lg max-w-2xl mt-10 mx-auto text-center">
                                Built for the modern AI workflow. Every animation is set by hand for
                                you to integrate into your project as your own code and to customize
                                however you want.
                            </p>

                            <ArrowDown strokeWidth={0.5} className="mx-auto size-10 mt-10" />
                        </div>

                        <LandingFeatureCards />
                    </section>

                    <section
                        id="pricing"
                        className="scroll-mt-nav-h mx-auto mt-40 mb-80 flex max-w-5xl flex-col items-center px-3 lg:px-5"
                    >
                        <p className="text-xs text-accent-2 uppercase mb-5">no subscription.</p>

                        <h2 className="flex flex-col items-center text-center text-4xl xxs:text-5xl sm:text-6xl lg:text-7xl font-light">
                            <span className="tracking-[-0.05em] mb-1">One payment.</span>
                            <span className="font-serif italic tracking-normal">
                                Followed by endless motion.
                            </span>
                        </h2>

                        <p className="text-lg max-w-2xl mt-10 mx-auto text-center">
                            A growing catalog of scroll scenes, text effects, WebGL shaders, and
                            cursor interactions. Production-ready React code, set by hand.
                            <span className="font-medium">
                                {" "}
                                Install them with the CLI, prompt your agent, or copy the source.
                            </span>
                        </p>

                        <ArrowDown strokeWidth={0.5} className="mx-auto size-10 mt-10 mb-30" />

                        <LandingPaymentCards checkoutHref={checkoutHref} proCtaSlot={proCtaSlot} />
                    </section>

                    <div className="w-fit flex-col flex items-center justify-center mx-auto pb-20">
                        <BarCode size={170} />
                        <small className='before:content-["***"] after:content-["***"] flex text-[0.7rem] font-mono uppercase tracking-wider items-center'>
                            assembled with care
                        </small>
                    </div>

                    <Border direction="vertical" className="-left-px -bottom-15 h-15" />
                    <Border direction="vertical" className="-right-px -bottom-15 h-15" />
                </div>
            </main>

            <Footer />
        </SmoothScroll>
    )
}
