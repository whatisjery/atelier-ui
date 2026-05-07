"use client"

import { toJsxRuntime } from "hast-util-to-jsx-runtime"
import { Check, Copy, ListChevronsDownUp } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { Fragment, jsx, jsxs } from "react/jsx-runtime"
import { IoTerminal } from "react-icons/io5"
import { SiCss, SiTypescript } from "react-icons/si"
import { toast } from "sonner"
import AnimatedArrow from "@/components/ui/AnimatedArrow"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import Tooltip from "@/components/ui/Tooltip"
import { useCopy } from "@/hooks/use-copy"
import { cn } from "@/lib/utils"
import type { CodeBlock, CodeHast } from "@/types/code"

type CodeBlockClientProps = {
    hast: CodeHast
} & CodeBlock

const iconMap: Record<string, React.ReactNode> = {
    tsx: <SiTypescript size={14} className="text-accent-1" />,
    ts: <SiTypescript size={14} className="text-accent-1" />,
    css: <SiCss size={14} className="text-accent-1" />,
    bash: <IoTerminal size={15} className="text-accent-1" />,
}

export default function CodeBlockClient({
    code,
    lang,
    title,
    hast,
    mode,
    installTabs,
    showLineNumbers,
    className,
}: CodeBlockClientProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [selectedTab, setSelectedTab] = useState(installTabs?.[0].value)

    const tTooltips = useTranslations("docs.tooltips")
    const tCommon = useTranslations("common")

    const { copied, copy } = useCopy({
        onSuccess: () =>
            toast.success(tCommon("copied"), {
                position: "top-center",
            }),
        resetAfterMs: 2000,
    })

    const CopyIcon = copied ? Check : Copy

    const copyButton = (
        <Tooltip side={mode === "preview" ? "bottom" : "top"} title="Copy">
            <Button
                onClick={() => copy(installTabs ? `${selectedTab} ${code}` : code)}
                className={cn({
                    "cursor-default pointer-events-none": copied,
                    "absolute top-3 right-3 z-2": mode === "preview",
                })}
                size="icon"
                variant="ghost"
                aria-label="Copy code"
            >
                <CopyIcon strokeWidth={1.5} className="size-4" />
            </Button>
        </Tooltip>
    )

    const header = (
        <>
            {installTabs && (
                <div className="flex items-center font-mono">
                    {iconMap.bash}

                    {installTabs.map((tab) => (
                        <Button
                            aria-label={tab.label}
                            key={tab.value}
                            variant="ghost"
                            className={cn(
                                "px-2 h-6.5 font-300 first-of-type:ml-4 border border-transparent",
                                {
                                    "bg-accent-5 border-theme-border text-accent-1 hover:text-accent-1":
                                        selectedTab === tab.value,
                                },
                            )}
                            onClick={() => setSelectedTab(tab.value)}
                        >
                            {tab.label}
                        </Button>
                    ))}
                </div>
            )}

            {!installTabs && (
                <div className="flex items-center gap-2.5 text-accent-2">
                    {iconMap[lang as keyof typeof iconMap]}
                    {title}
                </div>
            )}

            <div className="flex items-center">
                {isExpanded && mode === "expand" && (
                    <Tooltip title="Collapse">
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setIsExpanded(false)}
                            aria-label="Collapse"
                        >
                            <ListChevronsDownUp strokeWidth={1.5} className="size-4.5" />
                        </Button>
                    </Tooltip>
                )}
                {copyButton}
            </div>
        </>
    )

    return (
        <Card
            className={cn(
                "text-[0.85rem] not-prose not-last:mb-4 border relative overflow-hidden flex flex-col",
                className,
                { "border-none rounded-0 h-full": mode === "preview" },
            )}
            headerSlot={mode !== "preview" ? header : undefined}
        >
            {mode === "preview" && copyButton}

            {toJsxRuntime(hast, {
                Fragment,
                jsx,
                jsxs,
                components: {
                    pre: (props) => (
                        <pre
                            {...props}
                            className={cn("p-5 relative font-mono scrollbar-hide", {
                                "overflow-y-auto max-h-[500px]": mode === "scroll",
                                "m-0 flex-1 min-h-0 overflow-y-auto": mode === "preview",
                                "max-h-[200px] overflow-y-hidden": mode === "expand" && !isExpanded,
                                "max-h-full overflow-y-auto": mode === "expand" && isExpanded,
                                "code-block-line": !installTabs && showLineNumbers === true,

                                // makes the text color of the install tabs 'unthemed'.
                                "[&_*]:!text-accent-1": installTabs,
                            })}
                        >
                            {installTabs && (
                                <>
                                    {selectedTab} {props.children}
                                </>
                            )}

                            {!installTabs && props.children}

                            {mode === "expand" && (
                                <div
                                    className={cn(
                                        "bg-gradient-to-t from-30% from-bg to-100% to-transparent flex items-end h-full w-full absolute bottom-0 left-0 right-0",
                                        { "bg-transparent": isExpanded },
                                    )}
                                >
                                    <Button
                                        onClick={() => setIsExpanded(!isExpanded)}
                                        variant="primary"
                                        className="font-sans text-xs mx-auto mb-4 font-light border-dashed"
                                        aria-expanded={isExpanded}
                                    >
                                        {isExpanded ? (
                                            <>
                                                <AnimatedArrow direction="up" className="size-3" />
                                                Collapse
                                            </>
                                        ) : (
                                            <>
                                                <AnimatedArrow
                                                    direction="down"
                                                    className="size-3"
                                                />
                                                {tTooltips("expand-code")}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </pre>
                    ),
                    code: (props) => (
                        <code className="font-mono" {...props}>
                            {props.children}
                        </code>
                    ),
                },
            })}
        </Card>
    )
}
