"use client"

import CardGrid from "@/components/ui/CardGrid"
import DashedBorder from "@/components/ui/DashedBorder"
import { getLucideIcon } from "@/lib/utils"
import type { DocTree } from "@/types/docs"

type DocComponentListProps = {
    componentsList: DocTree[]
}

export default function DocComponentList({ componentsList }: DocComponentListProps) {
    return (
        <div className="space-y-6">
            {componentsList.map((component) => (
                <div className="border-b mb-15" key={component.title}>
                    <h3 className="not-prose text-xl font-semibold w-full gap-2 pb-2 border-b">
                        {component.category}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2">
                        {component.children.map((child, index) => {
                            const isLastItem = index === component.children.length - 1
                            const isLastRow = index >= component.children.length - 2
                            const isOdd = index % 2 === 0
                            const Icon = getLucideIcon(component.icon)

                            return (
                                <div key={child.title} className={"relative"}>
                                    {!isLastItem && (
                                        <DashedBorder
                                            className={`absolute bottom-0 left-0 right-0 ${
                                                isLastRow ? "md:hidden" : ""
                                            }`}
                                            direction="horizontal"
                                        />
                                    )}

                                    {isOdd && (
                                        <DashedBorder
                                            className="absolute top-0 right-0 bottom-0 hidden md:block"
                                            direction="vertical"
                                        />
                                    )}

                                    <CardGrid
                                        badge={child.status}
                                        iconSlot={<Icon strokeWidth={0.8} size={40} />}
                                        tags={child.tags}
                                        title={child.title}
                                        href={child.url}
                                    />
                                </div>
                            )
                        })}
                    </div>
                </div>
            ))}
        </div>
    )
}
