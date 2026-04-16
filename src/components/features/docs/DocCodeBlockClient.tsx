"use client"

import { toJsxRuntime } from "hast-util-to-jsx-runtime"
import { ArrowDown, ArrowUp, Check, Copy, ListChevronsDownUp } from "lucide-react"
import { useTranslations } from "next-intl"
import { type ComponentRef, useRef, useState } from "react"
import { Fragment, jsx, jsxs } from "react/jsx-runtime"
import { IoTerminal } from "react-icons/io5"
import { SiCss, SiTypescript } from "react-icons/si"
import type { codeToHast } from "shiki"
import { toast } from "sonner"
import Button from "@/components/ui/Button"
import Tooltip from "@/components/ui/Tooltip"
import { useCopy } from "@/hooks/use-copy"
import { cn } from "@/lib/utils"
import type { CodeBlock } from "@/types/code"

type DocCodBlockClientProps = {
    hast: Awaited<ReturnType<typeof codeToHast>>
} & CodeBlock

const iconMap: Record<string, React.ReactNode> = {
    tsx: <SiTypescript size={14} className="text-mat-1" />,
    ts: <SiTypescript size={14} className="text-mat-1" />,
    css: <SiCss size={14} className="text-mat-1" />,
    bash: <IoTerminal size={15} className="text-mat-1" />,
}

export function DocCodeBlockClient({
    code,
    lang,
    title,
    hast,
    mode,
    installTabs,
    className,
}: DocCodBlockClientProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [selectedTab, setSelectedTab] = useState(installTabs?.[0].value)
    const ref = useRef<ComponentRef<"figure">>(null)
    const t = useTranslations("docs.tooltips")
    const tCommon = useTranslations("common")

    const { copied, copy } = useCopy({
        onSuccess: () =>
            toast.success(tCommon("copied"), {
                position: "top-center",
            }),
        resetAfterMs: 2000,
    })

    return (
        <figure
            className={cn(
                "text-[0.85rem] font-regular not-prose bg-mat-5 rounded-lg not-last:mb-4 border border-mat-4 relative overflow-hidden flex flex-col",
                className,
            )}
        >
            <div className="flex items-center justify-between px-3">
                {installTabs ? (
                    <div className="flex items-center font-mono">
                        {iconMap.bash}
                        {installTabs.map((tab) => (
                            <Button
                                aria-label={tab.label}
                                key={tab.value}
                                variant="muted"
                                className={cn(
                                    "px-2 h-fit first-of-type:ml-4",
                                    selectedTab === tab.value && "text-mat-1",
                                )}
                                onClick={() => setSelectedTab(tab.value)}
                            >
                                {tab.label}
                            </Button>
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center gap-2.5 text-mat-2">
                        {iconMap[lang as keyof typeof iconMap]}
                        {title}
                    </div>
                )}

                <div className="flex items-center [&>*]:text-mat-2/50">
                    {isExpanded && mode === "expand" && (
                        <Tooltip title={t("collapse")}>
                            <Button
                                size="icon"
                                variant="muted"
                                onClick={() => setIsExpanded(false)}
                                aria-label={t("collapse")}
                            >
                                <ListChevronsDownUp className="size-4.5" />
                            </Button>
                        </Tooltip>
                    )}

                    <Tooltip title={t("copy")}>
                        <Button
                            onClick={() => copy(installTabs ? `${selectedTab} ${code}` : code)}
                            className={cn({
                                "cursor-default pointer-events-none": copied,
                            })}
                            size="icon"
                            variant="muted"
                        >
                            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                        </Button>
                    </Tooltip>
                </div>
            </div>

            {toJsxRuntime(hast, {
                Fragment,
                jsx,
                jsxs,
                components: {
                    pre: (props) => (
                        <pre
                            ref={ref}
                            {...props}
                            className={cn(
                                "p-5 relative not-prose rounded-lg m-0.5 scrollbar-hide [tab-size:2]",
                                {
                                    "overflow-y-auto max-h-[500px]": mode === "scroll",
                                    "max-h-[150px] overflow-y-hidden":
                                        mode === "expand" && !isExpanded,
                                    "max-h-full overflow-y-auto": mode === "expand" && isExpanded,
                                    "[&_*]:!text-mat-1": installTabs,
                                },
                            )}
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
                                        "bg-gradient-to-t from-30% from-background to-100% to-transparent flex items-end h-full w-full absolute bottom-0 left-0 right-0",
                                        { "bg-transparent": isExpanded },
                                    )}
                                >
                                    <Button
                                        onClick={() => setIsExpanded(!isExpanded)}
                                        variant="primary"
                                        className="w-fit p-3 mx-auto mb-4 font-sans rounded-full"
                                        aria-expanded={isExpanded}
                                    >
                                        {isExpanded ? (
                                            <>
                                                <ArrowUp className="size-4" />
                                                {t("collapse")}
                                            </>
                                        ) : (
                                            <>
                                                <ArrowDown className="size-4" />
                                                {t("expand-code")}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </pre>
                    ),
                    code: (props) => <code {...props}>{props.children}</code>,
                },
            })}
        </figure>
    )
}
