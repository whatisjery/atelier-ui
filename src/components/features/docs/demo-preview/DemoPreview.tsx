"use client"

import { AppWindow, CodeXml, Expand, Lock, Minimize, RotateCcw } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useLocale, useTranslations } from "next-intl"
import { type ComponentRef, useEffect, useEffectEvent, useMemo, useRef, useState } from "react"
import Logo from "@/components/common/Logo"
import ThemeSwitcher from "@/components/common/ThemeSwitcher"
import ControlList from "@/components/features/docs/controls/ControlList"
import ControlPanel from "@/components/features/docs/controls/ControlPanel"
import CopyPromptButton from "@/components/features/docs/demo-preview/CopyPromptButton"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import Tooltip from "@/components/ui/Tooltip"
import { env } from "@/env"
import { useIsTouch } from "@/hooks/use-is-touch"
import { useKeyDown } from "@/hooks/use-key-down"
import { useScrollLock } from "@/hooks/use-scroll-lock"
import { controlDefaults } from "@/lib/control-props"
import { useControlStore, useControlValues } from "@/lib/control-store"
import { expoOut } from "@/lib/ease"
import { cn } from "@/lib/utils"
import type { ControlDef, ControlValue } from "@/types/controls"

const MotionDocCard = motion.create(Card)

type PreviewMode = "big" | "small"

type DocComponentPreviewProps = {
    name: string
    title: string
    controls?: Record<string, ControlDef> | undefined
    codePreviewSlot: React.ReactNode
    lockedHref?: string | undefined
    footerSlot?: React.ReactNode
}

export default function DemoPreview({
    name,
    title,
    codePreviewSlot,
    controls = undefined,
    lockedHref = undefined,
    footerSlot = undefined,
}: DocComponentPreviewProps) {
    const defaults = controls ? controlDefaults(controls) : {}

    const iframeRef = useRef<ComponentRef<"iframe"> | null>(null)
    const locale = useLocale()
    const isTouchScreen = useIsTouch()
    const tControls = useTranslations("docs.controls")
    const tDemo = useTranslations("docs.demo-preview")
    const tTooltips = useTranslations("docs.tooltips")

    const controlledValues = useControlValues(name)
    const setControlValue = useControlStore((state) => state.setValue)
    const resetControlValues = useControlStore((state) => state.reset)

    const [iframeLoaded, setIframeLoaded] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)
    const [showCodePreview, setShowCodePreview] = useState(false)
    const [reloadKey, setReloadKey] = useState(0)
    const [animationDone, setAnimationDone] = useState(true)

    const ExpandIcon = isExpanded ? Minimize : Expand

    // The icon shows where the click leads: the code, or back to the running component.
    const CodeToggleIcon = showCodePreview ? AppWindow : CodeXml

    function updateControlledValues(key: string, value: ControlValue) {
        setControlValue(name, key, value)
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
            <div className="relative min-w-0 max-xl:order-1 xl:col-start-1 mb-4">
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40 bg-bg"
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
                    className={cn("will-change-transform overflow-hidden", {
                        "relative w-full mb-5": !isExpanded,
                        "fixed max-w-7xl w-full h-full md:w-[calc(100%-10rem)] md:h-[calc(100%-10rem)] inset-0 m-auto z-80 flex flex-col":
                            isExpanded,
                    })}
                    headerSlot={
                        <>
                            <div className="flex items-center gap-x-3 min-w-0 flex-1">
                                <ThemeSwitcher size="0.6rem" />

                                <div className="cursor-default max-sm:hidden min-w-0 max-w-60 flex-1 h-8 bg-accent-5 flex items-center gap-x-1 text-xs p-1 px-3 border rounded">
                                    <Lock className="size-2.5 mr-1 text-accent-2 shrink-0" />

                                    <span className="flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                                        {`${env.NEXT_PUBLIC_SITE_URL}/${name}`}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-x-1 h-8">
                                <Tooltip title={tTooltips("refresh-preview")}>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="group h-full disabled:opacity-20 disabled:cursor-not-allowed"
                                        onClick={reload}
                                        disabled={!iframeLoaded}
                                        aria-label="Refresh preview"
                                    >
                                        <RotateCcw
                                            strokeWidth={1.5}
                                            className="size-4 group-disabled:animate-spin group-disabled:direction-[reverse]"
                                        />
                                    </Button>
                                </Tooltip>

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

                                <CopyPromptButton
                                    name={name}
                                    title={title}
                                    controls={controls}
                                    lockedHref={lockedHref}
                                />
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
                                    {codePreviewSlot}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {lockedHref && (
                            <Tooltip side="left" title={tDemo("unlock-code")}>
                                <Button
                                    size="icon"
                                    variant="primary"
                                    asChild
                                    className={cn(
                                        "absolute bottom-3 right-3 z-30 text-accent-2 opacity-70 hover:opacity-100",
                                        { "max-sm:hidden": !isExpanded },
                                    )}
                                >
                                    <a
                                        href={lockedHref}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={tDemo("unlock-code")}
                                    >
                                        <Lock strokeWidth={1.5} className="size-4" />
                                    </a>
                                </Button>
                            </Tooltip>
                        )}

                        {!lockedHref && codePreviewSlot && (
                            <Tooltip
                                side="left"
                                title={showCodePreview ? tDemo("hide-code") : tDemo("show-code")}
                            >
                                <Button
                                    size="icon"
                                    variant="primary"
                                    onClick={() => setShowCodePreview((prev) => !prev)}
                                    aria-pressed={showCodePreview}
                                    aria-label={
                                        showCodePreview ? tDemo("hide-code") : tDemo("show-code")
                                    }
                                    className={cn("absolute bottom-3 right-3 z-30", {
                                        "max-sm:hidden": !isExpanded,
                                    })}
                                >
                                    <CodeToggleIcon strokeWidth={1.5} className="size-4" />
                                </Button>
                            </Tooltip>
                        )}

                        <button
                            type="button"
                            onClick={() => setPreviewMode("big")}
                            className={cn(
                                "bg-accent-5 flex sm:hidden absolute items-center cursor-pointer justify-center inset-0 h-full w-full z-20",
                                { "opacity-0 pointer-events-none": isExpanded },
                            )}
                        >
                            <div className="flex items-center gap-x-2 animate-pulse">
                                <ExpandIcon />

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
                                    "opacity-0 transition-opacity duration-200":
                                        iframeLoaded && animationDone,
                                },
                            )}
                        >
                            <Logo className="animate-pulse text-accent-3 size-20" />
                        </div>
                    </div>
                </MotionDocCard>

                {footerSlot}
            </div>

            {controls && (
                <>
                    <aside className="max-xl:hidden xl:col-start-2 xl:row-start-2 xl:row-end-[-1] pb-10">
                        <div className="xl:sticky xl:top-sticky-nested xl:h-fit">
                            <ControlPanel
                                className="rounded-md xl:max-h-[calc(100dvh-var(--spacing-sticky-nested)-var(--spacing-offset)-5rem)]"
                                footerSlot={
                                    <Button
                                        variant="ghost"
                                        className="shrink-0 rounded-none border-t py-7 border-t-theme-border text-xs font-light"
                                        aria-label="Restore default settings"
                                        onClick={() => resetControlValues(name)}
                                    >
                                        <RotateCcw strokeWidth={1.5} className="size-3" />
                                        {tControls("restore-defaults")}
                                    </Button>
                                }
                            >
                                <ControlList
                                    controls={controls}
                                    values={{ ...defaults, ...controlledValues }}
                                    onChange={updateControlledValues}
                                />
                            </ControlPanel>
                        </div>
                    </aside>

                    <div className="mb-10 max-xl:order-3 xl:hidden">
                        <div className="mb-2 flex justify-end">
                            <Button
                                variant="ghost"
                                className="h-8 gap-x-1.5 px-2 text-xs"
                                onClick={() => resetControlValues(name)}
                            >
                                {tControls("reset")}
                                <RotateCcw strokeWidth={1.5} className="size-3.5" />
                            </Button>
                        </div>

                        <div className="border-t pt-5">
                            <ControlList
                                controls={controls}
                                values={{ ...defaults, ...controlledValues }}
                                onChange={updateControlledValues}
                                fieldsClassName="grid gap-x-8 sm:grid-cols-2"
                            />
                        </div>
                    </div>
                </>
            )}
        </>
    )
}
