"use client"

import Link from "next/link"
import AnimatedArrow from "@/components/ui/AnimatedArrow"
import Badge from "@/components/ui/Badge"
import Card from "@/components/ui/Card"
import { cn, truncateText } from "@/lib/utils"
import type { DocTree } from "@/types/docs"
import DocStatusBadge from "../DocStatusBadge"

type CatalogCardProps = {
    catalogItem: DocTree
}

export default function CatalogCard({ catalogItem }: CatalogCardProps) {
    return (
        <Link href={catalogItem.url}>
            <Card
                className="w-full group transition-shadow duration-200 ease-expo-out cursor-pointer h-65 not-prose flex justify-between flex-col"
                key={catalogItem.title}
            >
                <div className="p-4">
                    <div className="text-xl justify-between w-full gap-2 flex items-center mb-1">
                        <h3 className="font-medium text-lg">{catalogItem.title}</h3>
                        <div className="flex items-center gap-x-1 group-hover:opacity-80 opacity-20 transition-opacity duration-200 ease-expo-out">
                            {["bg-accent-1", "bg-accent-1", "bg-accent-1"].map((bg, i) => (
                                <div key={i} className={cn(bg, "w-2 h-2 rounded-full")}></div>
                            ))}
                        </div>
                    </div>

                    <p className="font-light text-accent-2 mb-3">
                        {truncateText(catalogItem.description ?? "", 100)}
                    </p>

                    <div className="flex items-center gap-x-1 flex-wrap gap-1">
                        {catalogItem.tags?.map((tag) => (
                            <Badge title={tag} variant="neutral" key={tag} />
                        ))}
                    </div>
                </div>

                <div className="flex h-14 pattern-line relative px-5 border-t w-full items-center justify-between">
                    <div className="flex items-center justify-between w-full gap-x-1">
                        <span className="flex items-center gap-x-1 relative z-2">
                            <DocStatusBadge createdAt={catalogItem.createdAt} />
                        </span>
                        <AnimatedArrow className="size-4" />
                    </div>
                </div>
            </Card>
        </Link>
    )
}
