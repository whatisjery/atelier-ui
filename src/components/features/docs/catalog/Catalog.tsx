"use client"

import { Search, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { useKeyDown } from "@/hooks/use-key-down"
import type { DocTree } from "@/types/docs"
import CatalogCard from "./CatalogCard"

type CatalogProps = {
    catalogItems: DocTree[]
    facetByTag: boolean
}

type CatalogFilter = {
    label: string
    value: string
    count: number
}

type CatalogSection = {
    id: string
    heading?: string
    children: DocTree[]
}

export default function Catalog({ catalogItems, facetByTag }: CatalogProps) {
    const tCommon = useTranslations("common")
    const tCatalog = useTranslations("docs.catalog")

    const [query, setQuery] = useState("")
    const [activeFilter, setActiveFilter] = useState<string | null>(null)

    const allItems = catalogItems.flatMap((group) => group.children)
    const totalCount = allItems.length

    const matchesQuery = (item: DocTree) =>
        item.title.toLowerCase().includes(query.trim().toLowerCase())

    const filters: CatalogFilter[] = facetByTag
        ? [...new Set(allItems.flatMap((item) => item.tags ?? []))].sort().map((tag) => ({
              label: tag,
              value: tag,
              count: allItems.filter((item) => item.tags?.includes(tag)).length,
          }))
        : catalogItems.map((group) => ({
              label: group.category ?? group.title,
              value: group.url,
              count: group.children.length,
          }))

    const sections: CatalogSection[] = facetByTag
        ? [
              {
                  id: "all",
                  children: allItems.filter(
                      (item) =>
                          (activeFilter === null || item.tags?.includes(activeFilter)) &&
                          matchesQuery(item),
                  ),
              },
          ]
        : catalogItems
              .filter((group) => activeFilter === null || group.url === activeFilter)
              .map((group) => ({
                  id: group.url,
                  heading: group.category,
                  children: group.children.filter(matchesQuery),
              }))

    const visibleSections = sections.filter((section) => section.children.length > 0)
    const filteredCount = visibleSections.reduce((sum, section) => sum + section.children.length, 0)

    useKeyDown({
        key: "Escape",
        handler: () => {
            setQuery("")
        },
    })

    return (
        <div className="not-prose">
            <div className="flex items-center justify-between">
                <search className="relative flex items-center justify-stae h-12 w-90 py-10">
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

                <span className="text-xs text-accent-2 italic">
                    {tCatalog("results-count", {
                        filtered: filteredCount,
                        total: totalCount,
                    })}
                </span>
            </div>

            <div className="flex flex-col gap-y-2 border-t border-b py-5">
                <div className="flex flex-wrap gap-1.5">
                    <Button
                        size="tag"
                        variant={activeFilter === null ? "secondary" : "primary"}
                        onClick={() => setActiveFilter(null)}
                    >
                        {tCatalog("all")} ({totalCount})
                    </Button>

                    {filters.map((filter) => (
                        <Button
                            key={filter.value}
                            size="tag"
                            variant={activeFilter === filter.value ? "secondary" : "primary"}
                            onClick={() => setActiveFilter(filter.value)}
                        >
                            {filter.label} ({filter.count})
                        </Button>
                    ))}
                </div>
            </div>

            <div className="relative">
                {visibleSections.map((section) => (
                    <div className="mt-5" key={section.id}>
                        {section.heading && (
                            <h3 className="w-full py-4 flex items-center justify-between just gap-x-3 ml-1">
                                <span className="text-2xl font-serif ">{section.heading}</span>
                                <span className="text-2xl font-serif">
                                    / {section.children.length.toLocaleString().padStart(2, "0")}
                                </span>
                            </h3>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                            {section.children.map((child) => (
                                <CatalogCard key={child.title} catalogItem={child} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
