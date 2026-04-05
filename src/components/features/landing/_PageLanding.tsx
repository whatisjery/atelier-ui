"use client"

import { ArrowRight, FastForward, Feather, Layout } from "lucide-react"
import { motion } from "motion/react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { useState } from "react"
import Footer from "@/components/common/Footer"
import LogoOrnement from "@/components/common/LogoOrnement"
import ScrollableTechStack from "@/components/common/ScrollableTechStack"
import BarCode from "@/components/ui/BarCode"
import Border from "@/components/ui/Border"
import { VERSION } from "@/lib/constants"
import { expoInOut } from "@/lib/easing"
import { formatComponentNumber } from "@/lib/utils"
import { PixelatedText } from "@/registry/base/pixelated-text/pixelated-text"
import type { DocTree } from "@/types/docs"
import LandingGridScroll from "./LandingGridScroll"
import LandingLoopFlexibility from "./LandingLoopFlexibility"
import LandingLoopIntegration from "./LandingLoopIntegration"
import LandingLoopPerf from "./LandingLoopPerf"
import LandingNav from "./LandingNav"
import LandingTextAnimation from "./LandingTextAnimation"

const PALETTE = [
    "#ff3e3e",
    "#3eff8c",
    "#3e8cff",
    "#ff3edc",
    "#ffdc3e",
    "#3effe0",
    "#ff8c3e",
    "#c83eff",
]

const LOOP_FEATURES = [
    {
        icon: Layout,
        title: "loop-features.flexibility.title",
        description: "loop-features.flexibility.description",
        Component: LandingLoopFlexibility,
    },
    {
        icon: FastForward,
        title: "loop-features.integration.title",
        description: "loop-features.integration.description",
        Component: LandingLoopIntegration,
    },
    {
        icon: Feather,
        title: "loop-features.performance.title",
        description: "loop-features.performance.description",
        Component: LandingLoopPerf,
    },
] as const

type PageLadingProps = {
    showcaseComponents: DocTree[]
    activeComponents: DocTree[]
}

export default function PageLanding({ activeComponents, showcaseComponents }: PageLadingProps) {
    const t = useTranslations("landing")
    const tCommon = useTranslations("common")
    const [isSequenceComplete, setIsSequenceComplete] = useState(false)

    return (
        <>
            {!isSequenceComplete && (
                <>
                    <motion.div
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 0 }}
                        transition={{ duration: 1.5, ease: expoInOut, delay: 0.4 }}
                        onAnimationComplete={() => setIsSequenceComplete(true)}
                        className="cover fixed w-full h-full bg-background inset-0 z-4 pointer-events-none"
                    />

                    <motion.div
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 0 }}
                        transition={{ duration: 1, ease: expoInOut, delay: 0.8 }}
                        onAnimationComplete={() => setIsSequenceComplete(true)}
                        className="cover fixed w-full h-full backdrop-blur-[10px] bg-background/50 inset-0 z-4 pointer-events-none"
                    />
                </>
            )}

            <main className="w-full max-w-landing-max-w mx-auto px-1 lg:px-5 relative">
                <LandingNav activeComponentsCount={activeComponents.length} />

                <Border direction="horizontal" className="bottom-0" />

                <div className="w-full relative">
                    <Border
                        direction="vertical"
                        className="top-0 left-0 max-sm:hidden origin-top"
                    />
                    <Border
                        direction="vertical"
                        className="top-0 right-0 max-sm:hidden origin-top"
                    />

                    <section className="md:pt-30 pt-35 flex max-w-landing-inner-w mx-auto flex-col relative items-center justify-center">
                        <Border
                            direction="vertical"
                            className="top-0 left-0 max-sm:hidden h-full origin-bottom"
                        />
                        <Border
                            direction="vertical"
                            className="top-0 right-0 max-sm:hidden h-full origin-bottom"
                        />
                        <LogoOrnement />

                        <h1 className="intro-text font-semibold mb-5 md:text-[3.9rem] lg:text-[4.8rem] text-5xl lg:leading-[1em] text-center tracking-[-0.04em] w-[90%]">
                            <span className="block">
                                React{" "}
                                <PixelatedText
                                    colors={PALETTE}
                                    fps={200}
                                    pixelSize={2.1}
                                    flicker={0.9}
                                    chaos={0.3}
                                    depth={1}
                                    aberration={0}
                                    className="font-serif font-bold text-mat-2/40 relative top-[-0.02em]"
                                >
                                    WEB
                                </PixelatedText>{" "}
                                animations for{" "}
                            </span>
                            <span className="block">developers.</span>
                        </h1>

                        <p className="leading-[1.6em] mb-10 text-mat-2 max-w-full px-2 lg:px-0 lg:max-w-full text-center xs:text-xl text-base">
                            A growing collection of
                            <span className="text-mat-1 font-medium"> beautifully handcrafted</span>{" "}
                            animations, and interactive UI components for React, built with the{" "}
                            <span className="text-mat-1 font-medium">tools you already use</span>.
                        </p>

                        <div className="flex items-center justify-center gap-2">
                            <Link
                                href="/docs/components"
                                className="rounded-xl bg-background text-mat-1 border hover:border-mat-3 duration-100 font-medium relative z-2 py-4 px-5.5 flex items-center justify-center mb-18"
                            >
                                <ArrowRight className="size-4 mr-2" />
                                {tCommon("explore-components")}
                                <sup className="ml-1 font-mono">
                                    {formatComponentNumber(activeComponents.length)}
                                </sup>
                            </Link>
                        </div>
                    </section>

                    <section className="relative bg-background">
                        <div className="relative flex items-center justify-between gap-5 w-full">
                            <Border direction="horizontal" className="bottom-0 origin-right" />

                            <Border direction="horizontal" className="top-0 origin-left" />

                            <ScrollableTechStack fadeOnEachSide className="mx-auto h-[4.8rem]" />
                        </div>

                        <div className="grid md:grid-cols-3 grid-cols-1">
                            {LOOP_FEATURES.map((feature) => (
                                <div
                                    key={feature.title}
                                    className="cursor-default flex flex-col items-center justify-start relative p-5 aspect-[2/1.62] w-full"
                                >
                                    <Border direction="vertical" className="right-0 top-0" />

                                    <div className="h-full w-full pb-4">
                                        <feature.Component />
                                    </div>

                                    <div className="text-center flex flex-col items-center justify-start self-start w-full">
                                        <h3 className="border mb-2 bg-mat-5/20 rounded-md px-2 py-1 font-medium text-md flex items-center gap-x-2 justify-center">
                                            <feature.icon strokeWidth={1} size={17} />
                                            {t(feature.title)}
                                        </h3>
                                        <p className="text-mat-2/85 text-base sm:text-sm lg:text-base">
                                            {t(feature.description)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Border direction="horizontal" className="bottom-0" />
                    </section>

                    <section className="flex flex-col relative bg-background">
                        <LandingTextAnimation />

                        <LandingGridScroll items={showcaseComponents} />

                        <Border direction="horizontal" className="bottom-0" />

                        <span className="absolute z-4 bg-background backdrop-blur-[10px] -bottom-2 left-1/2 -translate-x-1/2 border-l border-r px-2 text-xs font-mono uppercase tracking-wider">
                            work in progress
                        </span>
                    </section>

                    <div className="flex flex-col items-center h-180 justify-end pb-20 relative max-w-landing-inner-w mx-auto">
                        <Border direction="vertical" className="top-0 left-0 max-sm:hidden" />
                        <Border direction="vertical" className="top-0 right-0 max-sm:hidden" />
                        <div className="w-fit flex-col flex items-center justify-center">
                            <BarCode size={170} />
                            <small className='before:content-["***"] after:content-["***"] flex text-[0.7rem] font-mono uppercase tracking-wider items-center'>
                                version {VERSION} wip
                            </small>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </>
    )
}
