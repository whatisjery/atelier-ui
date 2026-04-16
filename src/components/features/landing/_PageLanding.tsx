"use client"

import { FastForward, Feather, Layout } from "lucide-react"
import { useTranslations } from "next-intl"
import Footer from "@/components/common/Footer"
import MainNav from "@/components/common/MainNav"
import ScrollableTechStack from "@/components/common/ScrollableTechStack"
import AnimatedArrow from "@/components/ui/AnimatedArrow"
import BarCode from "@/components/ui/BarCode"
import Border from "@/components/ui/Border"
import Button from "@/components/ui/Button"
import BackgroundPixelGrid from "@/components/ui/PixelGrid"
import { Link } from "@/i18n/navigation"
import { DEFAULT_PIXEL_SIZE, VERSION } from "@/lib/constants"
import { PixelatedText } from "@/registry/base/pixelated-text/pixelated-text"
import type { DocTree } from "@/types/docs"
import LandingGridScroll from "./LandingGridScroll"
import LandingLoopFlexibility from "./LandingLoopFlexibility"
import LandingLoopIntegration from "./LandingLoopIntegration"
import LandingLoopPerf from "./LandingLoopPerf"
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
}

export default function PageLanding({ showcaseComponents }: PageLadingProps) {
    const t = useTranslations("landing")

    return (
        <>
            <main className="w-full max-w-base-w mx-auto relative">
                <MainNav />

                <div className="w-full relative">
                    <section className="pb-30 pt-25 flex  mx-auto flex-col relative items-center justify-center">
                        <BackgroundPixelGrid
                            className="left-[calc(50%-50vw)] w-screen -z-1"
                            pixelSize={DEFAULT_PIXEL_SIZE}
                        />

                        <div className="border border-mat-4 font-serif px-3 py-1 rounded-full text-md bg-mat-5 mb-5 flex items-center gap-x-2">
                            Atelier UI (beta 0.2.0) &mdash; &copy;2026.
                        </div>

                        <h1 className="intro-text font-semibold md:text-[3.9rem] lg:text-[5rem] text-[3.3rem] lg:leading-[1.1em] text-center tracking-[-0.05em] leading-[1.1em] w-full">
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
                                    className="font-serif text-mat-2/40 relative top-[-0.02em]"
                                >
                                    WEB
                                </PixelatedText>{" "}
                                animations {"("}for{" "}
                            </span>
                            <span className="block">developers).</span>
                        </h1>

                        <p className="leading-[1.8em] my-8 text-mat-2 max-w-full px-2 lg:px-0 sm:max-w-[40rem] md:max-w-[45rem] text-center xs:text-lg text-base">
                            A growing collection of{" "}
                            <span className="text-mat-1 font-medium">premium handcrafted</span>{" "}
                            react animations built with TypeScript, Tailwind CSS, and Motion and
                            React Three Fiber.
                        </p>

                        <div className="flex flex-col sm:flex-row w-full items-center justify-center gap-2">
                            <Button
                                asChild
                                variant="secondary"
                                size="big"
                                className="gap-x-2 h-12 px-7 max-sm:w-full"
                            >
                                <a
                                    target="_blank"
                                    className="text-md"
                                    href={process.env.NEXT_PUBLIC_POLAR_CHECKOUT_URL ?? ""}
                                    rel="noopener"
                                >
                                    Get pro access
                                    <AnimatedArrow />
                                </a>
                            </Button>

                            <Button
                                asChild
                                variant="primary"
                                size="big"
                                className="gap-x-2 h-12.5 px-7 max-sm:w-full"
                            >
                                <Link className="text-md" href="/docs">
                                    Read the docs
                                    <AnimatedArrow />
                                </Link>
                            </Button>
                        </div>
                    </section>

                    <section className="relative bg-background max-w-[1280px] mx-auto">
                        <Border
                            direction="vertical"
                            className="top-0 left-0 max-sm:hidden origin-top"
                        />
                        <Border
                            direction="vertical"
                            className="top-0 right-0 max-sm:hidden origin-top"
                        />

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

                    <section className="flex flex-col relative bg-background max-w-[1280px] mx-auto">
                        <Border
                            direction="vertical"
                            className="top-0 left-0 max-sm:hidden origin-top"
                        />
                        <Border
                            direction="vertical"
                            className="top-0 right-0 max-sm:hidden origin-top"
                        />
                        <LandingTextAnimation />

                        <LandingGridScroll items={showcaseComponents} />

                        <Border direction="horizontal" className="bottom-0" />

                        <span className="absolute z-4 bg-background backdrop-blur-[10px] -bottom-2 left-1/2 -translate-x-1/2 border-l border-r px-2 text-xs font-mono uppercase tracking-wider">
                            work in progress
                        </span>
                    </section>

                    <div className="flex flex-col items-center h-180 justify-end pb-20 relative max-w-[60rem] mx-auto">
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
