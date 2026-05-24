"use client"

import { Search, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { useKeyDown } from "@/hooks/use-key-down"
import { getLucideIcon } from "@/lib/utils"
import type { DocTree } from "@/types/docs"
import CatalogCard from "./CatalogCard"

function countElements(items: DocTree[]) {
    let itemCount = 0
    const tagCounts: Record<string, number> = {}

    for (const component of items) {
        for (const child of component.children) {
            itemCount++
            for (const tag of child.tags ?? []) {
                if (tagCounts[tag]) tagCounts[tag]++
                else tagCounts[tag] = 1
            }
        }
    }
    return { itemCount, tagCounts }
}

type CatalogProps = {
    catalogItems: DocTree[]
    title: string
}

export default function Catalog({ catalogItems, title }: CatalogProps) {
    const tCommon = useTranslations("common")
    const tCatalog = useTranslations("docs.catalog")

    const [query, setQuery] = useState("")
    const [activeTags, setActiveTags] = useState<string[]>([])
    const { itemCount, tagCounts } = countElements(catalogItems)

    function toggleTag(tag: string) {
        setActiveTags((prev) => {
            if (prev.includes(tag)) return prev.filter((t) => t !== tag)
            return [...prev, tag]
        })
    }

    function filterChildren(item: DocTree) {
        return item.children.filter((child) => {
            if (query.trim()) return child.title.toLowerCase().includes(query.trim().toLowerCase())
            if (activeTags.length > 0) return child.tags?.some((tag) => activeTags.includes(tag))
            return true
        })
    }

    const filteredList = catalogItems
        .map((item) => ({ ...item, children: filterChildren(item) }))
        .filter(({ children }) => children.length > 0)

    const filteredCount = filteredList.flatMap(({ children }) => children).length

    useKeyDown({
        key: "Escape",
        handler: () => {
            setQuery("")
        },
    })

    return (
        <div className="not-prose">
            <h2 className="text-3xl font-semibold mb-5">
                {title} ({filteredCount})
            </h2>

            <div className="flex flex-col gap-y-2">
                <search className="relative flex items-center justify-between h-12">
                    <Search className="size-4 text-accent-1 ml-3" />
                    <Input
                        type="search"
                        value={query}
                        className="absolute text-sm px-9 w-full"
                        placeholder={tCommon("search")}
                        aria-label={tCommon("search")}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    {query.length > 0 && (
                        <Button
                            variant="ghost"
                            className="relative z-2"
                            onClick={() => setQuery("")}
                        >
                            <X size={17} />
                        </Button>
                    )}
                </search>

                <div className="flex flex-wrap gap-1.5">
                    {Object.keys(tagCounts).map((tag) => {
                        const isActive = activeTags.includes(tag)
                        return (
                            <Button
                                key={tag}
                                size="tag"
                                variant={isActive ? "secondary" : "primary"}
                                onClick={() => toggleTag(tag)}
                            >
                                {tag} ({tagCounts[tag]})
                            </Button>
                        )
                    })}
                </div>
            </div>

            <div className="text-sm text-accent-2 flex items-center gap-x-3 pt-10 mb-2">
                {activeTags.length > 0 && (
                    <button
                        type="button"
                        onClick={() => setActiveTags([])}
                        className="hover:text-accent-3 font-medium text-accent-1 cursor-pointer flex items-center gap-x-0.5"
                    >
                        <X size={15} />
                        {tCatalog("clear-filters")}
                    </button>
                )}

                <span>
                    {tCatalog("results-count", {
                        filtered: filteredCount,
                        total: itemCount,
                    })}
                </span>
            </div>

            <div className="relative">
                {filteredList.map((item) => {
                    const Icon = getLucideIcon(item.icon)

                    return (
                        <div className="mb-15 border-t pt-10 border-dashed" key={item.title}>
                            <h3 className="not-prose font-semibold w-full gap-2 pb-2 flex items-center">
                                <Icon
                                    strokeWidth={1.5}
                                    className="size-6 p-1 rounded-md text-accent-1 bg-accent-4"
                                />
                                <span className="text-xl font-medium">{item.category}</span>
                            </h3>

                            <div className="grid md:grid-cols-2 2xl:grid-cols-3 gap-3">
                                {item.children.map((child) => (
                                    <CatalogCard key={child.title} catalogItem={child} />
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
