"use client"

import { LockIcon } from "lucide-react"
import { motion } from "motion/react"
import { useId, useState } from "react"
import { expoOut } from "@/lib/easing"
import { cn } from "@/lib/utils"

type Tab<T extends string> = {
    label: string
    value: T
    icon?: React.ReactNode
    disabled?: boolean
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
            <div className="flex mb-3 w-fit p-1 rounded-lg">
                {tabs.map((tab) => (
                    <button
                        type="button"
                        aria-label={tab.label}
                        key={tab.value}
                        onClick={() => setActiveTab(tab.value)}
                        className={cn(
                            "relative py-1 px-3 rounded-lg font-medium text-sm border-b-2 border-b-transparent cursor-pointer bg-transparent",
                            {
                                "text-background": activeTab === tab.value,
                                "hover:text-mat-1 text-mat-2": activeTab !== tab.value,
                                "opacity-70 pointer-events-none": tab.disabled,
                            },
                        )}
                    >
                        {activeTab === tab.value && (
                            <motion.span
                                layoutId={id}
                                className="absolute inset-0 rounded-lg bg-mat-1"
                                transition={{ ease: expoOut, duration: 0.3 }}
                            />
                        )}

                        <span className="relative z-10 flex items-center gap-x-1.5">
                            {tab.disabled && <LockIcon className="size-4" />}
                            {tab.icon && tab.icon}
                            {tab.label}
                        </span>
                    </button>
                ))}
            </div>
            {contents[activeTab]}
        </div>
    )
}
