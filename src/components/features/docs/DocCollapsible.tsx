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
                <CollapsiblePrimitive.Trigger className="group flex cursor-pointer items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-ring justify-between w-full transition-opacity duration-200 hover:opacity-70">
                    {title}

                    {/* The box stays put, only the glyph inside it turns. */}
                    <span className="inline-flex size-7 items-center justify-center rounded border bg-bg p-1 text-accent-2">
                        <ChevronDown
                            strokeWidth={1.7}
                            className="size-5 transition-transform duration-200 group-data-[state=open]:rotate-180"
                        />
                    </span>
                </CollapsiblePrimitive.Trigger>
            </h2>

            <CollapsiblePrimitive.Content forceMount className="data-[state=closed]:hidden">
                {children}
            </CollapsiblePrimitive.Content>
        </CollapsiblePrimitive.Root>
    )
}
