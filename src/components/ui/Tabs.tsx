"use client"

import { motion } from "motion/react"
import { useId, useState } from "react"
import { expoOut } from "@/lib/easing"
import { cn } from "@/lib/utils"

type Tab<T extends string> = {
    label: string
    value: T
}

type Props<T extends string> = {
    tabs: Tab<T>[]
    defaultValue: T
    contents: Record<T, React.ReactNode>
    className?: string
}

export default function Tabs<T extends string>({
    tabs,
    defaultValue,
    contents,
    className,
}: Props<T>) {
    const [activeTab, setActiveTab] = useState<T>(defaultValue)
    const id = useId()

    return (
        <div className={className}>
            <div className="flex mb-3 bg-mat-5 w-fit p-1 rounded-lg">
                {tabs.map((tab) => (
                    <button
                        type="button"
                        aria-label={tab.label}
                        key={tab.value}
                        onClick={() => setActiveTab(tab.value)}
                        className={cn(
                            "relative p-1 px-3 rounded-lg font-medium text-sm border-b-2 border-b-transparent text-mat-2/80 cursor-pointer bg-transparent transition-colors hover:text-mat-1",
                            {
                                "text-mat-1": activeTab === tab.value,
                            },
                        )}
                    >
                        {activeTab === tab.value && (
                            <motion.span
                                layoutId={id}
                                className="absolute inset-0 rounded-lg bg-background"
                                transition={{ ease: expoOut, duration: 0.3 }}
                            />
                        )}
                        <span className="relative z-10">{tab.label}</span>
                    </button>
                ))}
            </div>
            {contents[activeTab]}
        </div>
    )
}
