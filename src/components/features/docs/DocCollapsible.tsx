"use client"

import { ChevronDown } from "lucide-react"
import { Collapsible as CollapsiblePrimitive } from "radix-ui"
import { slugify } from "@/lib/utils"

type DocCollapsibleProps = {
    title: string
    children: React.ReactNode
    defaultOpen?: boolean
}

export default function DocCollapsible({
    title,
    children,
    defaultOpen = false,
}: DocCollapsibleProps) {
    return (
        <CollapsiblePrimitive.Root defaultOpen={defaultOpen}>
            <h2 id={slugify(title)} className="scroll-mt-sticky-nested text-2xl font-semibold">
                <CollapsiblePrimitive.Trigger className="group flex cursor-pointer items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-ring justify-between w-full">
                    {title}

                    <ChevronDown
                        strokeWidth={1.7}
                        className="size-7 rounded text-accent-2 bg-bg border p-1 transition-transform duration-200 group-data-[state=open]:rotate-180"
                    />
                </CollapsiblePrimitive.Trigger>
            </h2>

            <CollapsiblePrimitive.Content forceMount className="data-[state=closed]:hidden">
                {children}
            </CollapsiblePrimitive.Content>
        </CollapsiblePrimitive.Root>
    )
}
