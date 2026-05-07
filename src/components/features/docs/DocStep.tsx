"use client"

import { Children } from "react"

type DocStepProps = {
    title: string
    children: React.ReactNode
    step: number
}

export default function DocStep({ children, step }: DocStepProps) {
    const childArray = Children.toArray(children)

    return (
        <section className="mt-8 w-full min-w-0 mb-14">
            <div className="text-accent-1 -mt-1.5 mb-3 not-prose flex items-center sm:gap-x-4 gap-x-2">
                <div className="bg-theme-bg text-xs text-theme-fg size-5 flex items-center justify-center rounded-sm font-medium">
                    {step}
                </div>

                {childArray[0]}
            </div>
            <div className="sm:ml-9">{childArray.slice(1)}</div>
        </section>
    )
}
