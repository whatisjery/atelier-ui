"use client"

import { FastForward, Feather, Layout } from "lucide-react"
import { type AnimationSequence, animate, stagger, useIsomorphicLayoutEffect } from "motion/react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import Footer from "@/components/common/Footer"
import LogoOrnement from "@/components/common/LogoOrnement"
import ScrollableTechStack from "@/components/common/ScrollableTechStack"
import LandingActionButton from "@/components/features/landing/LandingActionButton"
import BarCode from "@/components/ui/BarCode"
import Border from "@/components/ui/Border"
import SplitText from "@/components/ui/SplitText"
import { expoInOut, expoOut } from "@/lib/easing"
import type { DocTree } from "@/types/docs"
import LandingGridScroll from "./LandingGridScroll"
import LandingLoopFlexibility from "./LandingLoopFlexibility"
import LandingLoopIntegration from "./LandingLoopIntegration"
import LandingLoopPerf from "./LandingLoopPerf"
import LandingNav from "./LandingNav"
import LandingTextAnimation from "./LandingTextAnimation"

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

const sequence: AnimationSequence = [
    [
        ".intro-text .word",
        {
            opacity: [0, 1],
            filter: ["blur(10px)", "blur(0px)"],
        },
        {
            duration: 1.9,
            delay: stagger(0.007, { from: "center", startDelay: 1 }),
            ease: expoOut,
        },
    ],
    [
        ".cover",
        {
            opacity: [1, 0],
        },
        {
            duration: 1.5,
            ease: expoInOut,
            at: "-2.6",
        },
    ],
]

type PageLadingProps = {
    showcaseComponents: DocTree[]
    activeComponents: DocTree[]
}

export default function PageLanding({ activeComponents, showcaseComponents }: PageLadingProps) {
    const t = useTranslations("landing")
    const [isSequenceComplete, setIsSequenceComplete] = useState(false)

    useIsomorphicLayoutEffect(() => {
        const controls = animate(sequence, {
            onComplete: () => setIsSequenceComplete(true),
        })
        return () => controls.stop()
    }, [])

    return (
        <>
            {!isSequenceComplete && (
                <div className="cover fixed w-full h-full bg-background inset-0 z-4 pointer-events-none"></div>
            )}

            <main className="w-full max-w-landing-max-w mx-auto px-2 xs:px-5 relative">
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

                    <section className="pt-38 flex max-w-landing-inner-w mx-auto flex-col relative items-center justify-center">
                        <Border
                            direction="vertical"
                            className="top-0 left-0 max-sm:hidden h-[calc(100%+4.8rem)] origin-bottom"
                        />
                        <Border
                            direction="vertical"
                            className="top-0 right-0 max-sm:hidden h-[calc(100%+4.8rem)] origin-bottom"
                        />
                        <LogoOrnement />

                        <h1 className="intro-text z-5 relative font-semibold mb-5 xs:text-5xl lg:text-[4.5rem] text-4xl text-center tracking-[-0.04em] w-[90%]">
                            <SplitText tracking="-0.04em" wordClassName="opacity-0 word">
                                React (web) animations for developers.
                            </SplitText>
                        </h1>

                        <p className="intro-element mb-10 text-mat-2 max-w-full px-2 lg:px-0 lg:max-w-full text-center xs:text-xl text-base">
                            A collection of
                            <span className="text-mat-1"> beautifully handcrafted</span> animations,
                            and interactive UI components for React, built with the{" "}
                            <span className="text-mat-1">tools you already use</span>.
                        </p>

                        <div className="intro-element flex items-center gap-x-1 mb-18 h-14 font-base">
                            <LandingActionButton activeComponentsCount={activeComponents.length} />
                        </div>
                    </section>

                    <section className="relative overflow-hidden">
                        <div className="relative flex items-center justify-between gap-5 w-full bg-background">
                            <Border direction="horizontal" className="bottom-0 origin-right" />
                            <Border direction="horizontal" className="top-0 origin-left" />
                            <ScrollableTechStack
                                fadeOnEachSide
                                className="max-w-landing-inner-w mx-auto h-[4.8rem]"
                            />
                        </div>

                        <div className="grid md:grid-cols-3 grid-cols-1 bg-background">
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
                                        <h3 className="font-medium text-lg flex items-center gap-x-2 justify-center">
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

                    <section className="flex flex-col relative">
                        <LandingTextAnimation />

                        <LandingGridScroll items={showcaseComponents} />

                        <Border direction="horizontal" className="bottom-0" />

                        <span className="absolute z-3 -bottom-2 left-1/2 -translate-x-1/2 border-l border-r px-2 bg-background text-xs font-mono uppercase tracking-wider">
                            work in progress
                        </span>
                    </section>

                    <div className="flex flex-col items-center h-180 justify-end pb-20 relative max-w-landing-inner-w mx-auto">
                        <Border direction="vertical" className="top-0 left-0 max-sm:hidden" />
                        <Border direction="vertical" className="top-0 right-0 max-sm:hidden" />
                        <div className="w-fit flex-col flex items-center justify-center">
                            <BarCode size={170} />
                            <small className='before:content-["****"] after:content-["****"] flex text-[0.7rem] font-mono uppercase tracking-wider items-center'>
                                MADE BY HUMANS
                            </small>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </>
    )
}
