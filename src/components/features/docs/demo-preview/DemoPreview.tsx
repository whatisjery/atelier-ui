"use client"

import { Lock, Maximize, Minimize, RotateCcw } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useLocale, useTranslations } from "next-intl"
import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react"
import Logo from "@/components/common/Logo"
import ThemeSwitcher from "@/components/common/ThemeSwitcher"
import ControlsPanel from "@/components/features/docs/controls/ControlPanel"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import Tooltip from "@/components/ui/Tooltip"
import { env } from "@/env"
import { useIsTouch } from "@/hooks/use-is-touch"
import { useKeyDown } from "@/hooks/use-key-down"
import { useScrollLock } from "@/hooks/use-scroll-lock"
import { expoOut } from "@/lib/ease"
import { useGlobalStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { components } from "@/registry"
import type { ControlDef, ControlValue } from "@/types/controls"

const MotionDocCard = motion.create(Card)

type PreviewMode = "big" | "small"

type ControlledState = Record<string, ControlValue>

type DocComponentPreviewProps = {
    name: string
    controls?: Record<string, ControlDef> | undefined
    codePreviewSlot: React.ReactNode
}

export default function DemoPreview({
    name,
    codePreviewSlot,
    controls = undefined,
}: DocComponentPreviewProps) {
    const defaults = controls
        ? Object.fromEntries(Object.entries(controls).map(([key, { value }]) => [key, value]))
        : {}

    const iframeRef = useRef<HTMLIFrameElement | null>(null)
    const locale = useLocale()
    const customer = useGlobalStore((s) => s.customer)
    const isTouchScreen = useIsTouch()
    const tDemo = useTranslations("docs.demo-preview")
    const tTooltips = useTranslations("docs.tooltips")

    const [controlledValues, setControlledValues] = useState<ControlledState>({})
    const [iframeLoaded, setIframeLoaded] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)
    const [showCodePreview, setShowCodePreview] = useState(false)
    const [reloadKey, setReloadKey] = useState(0)
    const [animationDone, setAnimationDone] = useState(true)

    const ExpandIcon = isExpanded ? Minimize : Maximize
    const isPro = components.some((component) => component.name === name && component.pro)
    const isSourceCodeDisabled = isPro && !customer

    function updateControlledValues(key: string, value: ControlValue) {
        setControlledValues((prev) => ({ ...prev, [key]: value }))
    }

    function reload() {
        setIframeLoaded(false)
        setReloadKey((prev) => prev + 1)
    }

    function setPreviewMode(mode: PreviewMode) {
        setIsExpanded(mode === "big")
        setAnimationDone(false)
    }

    function handleLayoutAnimationComplete() {
        setAnimationDone(true)
        reload()
    }

    const sendControlledValues = useEffectEvent(() => {
        const frame = iframeRef.current
        if (!frame) return
        if (!frame.contentWindow) return

        frame.contentWindow.postMessage(
            { type: "atelier:controls", values: controlledValues },
            window.location.origin,
        )
    })

    const initialSrc = useMemo(
        () => `/${locale}/preview/${name}?v=${reloadKey}`,
        [locale, name, reloadKey],
    )

    useScrollLock(isExpanded)

    useKeyDown({
        key: "Escape",
        handler: () => {
            if (isExpanded) setIsExpanded(false)
        },
    })

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return
            if (event.data?.type !== "atelier:ready") return
            setIframeLoaded(true)
            sendControlledValues()
        }
        window.addEventListener("message", handleMessage)
        return () => window.removeEventListener("message", handleMessage)
    }, [])

    useEffect(() => {
        sendControlledValues()
    }, [controlledValues])

    return (
        <>
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 bg-bg/80 backdrop-blur-sm"
                        onClick={() => setPreviewMode("small")}
                    />
                )}
            </AnimatePresence>

            <MotionDocCard
                layout
                layoutDependency={isExpanded}
                transition={{ ease: expoOut, duration: 0.4 }}
                onLayoutAnimationComplete={handleLayoutAnimationComplete}
                role={isExpanded ? "dialog" : undefined}
                aria-modal={isExpanded ? true : undefined}
                aria-label={isExpanded ? "Live preview" : undefined}
                className={cn("will-change-transform", {
                    "relative w-full mb-5": !isExpanded,
                    "fixed max-w-7xl w-full h-full md:w-[calc(100%-10rem)] md:h-[calc(100%-10rem)] inset-0 m-auto z-80 flex flex-col":
                        isExpanded,
                })}
                headerSlot={
                    <>
                        <div className="flex items-center gap-x-3 min-w-0 flex-1">
                            <ThemeSwitcher size="0.6rem" />

                            <div className="cursor-default min-w-0 max-w-60 flex-1 h-8 bg-accent-5 flex items-center gap-x-1 text-xs p-1 px-3 border rounded">
                                <Lock className="size-2.5 mr-1 text-accent-2 shrink-0" />

                                <span className="flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                                    {`${env.NEXT_PUBLIC_SITE_URL}/${name}`}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-x-1 h-8">
                            <Tooltip title={tTooltips("expand-preview")}>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-full"
                                    onClick={() => setPreviewMode(isExpanded ? "small" : "big")}
                                    aria-label={
                                        isExpanded ? "Close expanded preview" : "Expand preview"
                                    }
                                >
                                    <ExpandIcon strokeWidth={1.5} className="size-4" />
                                </Button>
                            </Tooltip>

                            <span className="bg-border h-6 w-px flex" />

                            <Tooltip title={tTooltips("refresh-preview")}>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-full disabled:opacity-20 disabled:cursor-not-allowed disabled:animate-spin disabled:[animation-direction:reverse]"
                                    onClick={reload}
                                    disabled={!iframeLoaded}
                                    aria-label="Refresh preview"
                                >
                                    <RotateCcw strokeWidth={1.5} className="size-4" />
                                </Button>
                            </Tooltip>

                            {!isSourceCodeDisabled && (
                                <Button
                                    variant="secondary"
                                    className="px-4 w-25 h-full whitespace-nowrap text-xs"
                                    onClick={() => setShowCodePreview((prev) => !prev)}
                                >
                                    {showCodePreview ? tDemo("hide-code") : tDemo("show-code")}
                                </Button>
                            )}

                            {isSourceCodeDisabled && (
                                <Button
                                    variant="secondary"
                                    asChild
                                    className="px-4 w-25 h-full whitespace-nowrap text-xs"
                                >
                                    <a
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="no-underline"
                                        href={env.NEXT_PUBLIC_POLAR_CHECKOUT_URL}
                                    >
                                        {tDemo("unlock-code")}
                                    </a>
                                </Button>
                            )}
                        </div>
                    </>
                }
            >
                <div
                    className={cn("w-full relative block overflow-hidden", {
                        "h-135": !isExpanded,
                        "flex-1": isExpanded,
                    })}
                >
                    <motion.iframe
                        animate={{ scale: showCodePreview ? 0.98 : 1 }}
                        style={{ visibility: animationDone ? "visible" : "hidden" }}
                        transition={{ duration: 0.3, ease: expoOut }}
                        ref={iframeRef}
                        src={initialSrc}
                        title={name}
                        className="w-full h-full"
                        onLoad={() => setIframeLoaded(true)}
                    />

                    <AnimatePresence>
                        {showCodePreview && (
                            <motion.div
                                className="absolute top-0 left-0 w-full h-full"
                                initial={{ scale: 0.98, filter: "blur(3px)", opacity: 0 }}
                                animate={{ scale: 1, filter: "blur(0px)", opacity: 1 }}
                                exit={{ scale: 0.98, filter: "blur(3px)", opacity: 0 }}
                                transition={{ duration: 0.3, ease: expoOut }}
                            >
                                {!isSourceCodeDisabled && codePreviewSlot}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        type="button"
                        onClick={() => setPreviewMode("big")}
                        className={cn(
                            "bg-accent-5 flex sm:hidden absolute items-center cursor-pointer justify-center inset-0 h-full w-full z-20",
                            { "opacity-0 pointer-events-none": isExpanded },
                        )}
                    >
                        <div className="flex items-center gap-x-2 animate-pulse">
                            <Maximize />

                            <span className="text-2xl">
                                {isTouchScreen
                                    ? tDemo("tap-to-preview")
                                    : tDemo("click-to-preview")}
                            </span>
                        </div>
                    </button>

                    <div
                        aria-hidden={true}
                        className={cn(
                            "absolute h-full opacity-100 w-full bottom-0 inset-0 flex items-center justify-center z-10 bg-accent-5 pointer-events-none",
                            {
                                "opacity-0 transition-opacity duration-200 delay-100":
                                    iframeLoaded && animationDone,
                            },
                        )}
                    >
                        <Logo className="animate-pulse text-accent-3 size-20" />
                    </div>
                </div>
            </MotionDocCard>

            {controls && !isSourceCodeDisabled && (
                <ControlsPanel
                    controls={controls}
                    onChange={updateControlledValues}
                    onReset={() => setControlledValues({})}
                    values={{ ...defaults, ...controlledValues }}
                />
            )}
        </>
    )
}
