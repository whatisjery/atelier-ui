"use client"

import Fuse from "fuse.js"
import { useLocale } from "next-intl"
import { useEffect, useEffectEvent, useState } from "react"
import type { SearchEntry } from "@/types/scripts"

const LIMIT_RESULTS = 5

/**
 * Performs client side search for documentation.
 */
export function useDocSearch() {
    const locale = useLocale()
    const [fuse, setFuse] = useState<Fuse<SearchEntry> | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState<SearchEntry[]>([])

    const onFuseReady = useEffectEvent((instance: Fuse<SearchEntry>) => {
        setFuse(instance)
    })

    useEffect(() => {
        ;(async () => {
            try {
                const index = await fetch(`/search-index/${locale}.json`)
                const data = await index.json()

                const fuseInstance = new Fuse<SearchEntry>(data, {
                    keys: [
                        { name: "title", weight: 2 },
                        { name: "content", weight: 1 },
                        { name: "headings", weight: 1.5 },
                        { name: "section", weight: 1.2 },
                    ],
                    threshold: 0.4,
                    includeScore: true,
                    minMatchCharLength: 2,
                    ignoreLocation: true,
                })
                onFuseReady(fuseInstance)
            } catch (error) {
                console.error(error)
            }
        })()
    }, [locale])

    const handleSearch = (value: string) => {
        setSearchQuery(value)
        if (!fuse || !value.trim()) {
            setSearchResults([])
            return
        }

        setSearchResults(
            fuse
                .search(value)
                .slice(0, LIMIT_RESULTS)
                .map((result) => result.item),
        )
    }

    const handleClear = () => {
        setSearchQuery("")
        setSearchResults([])
    }

    return {
        searchQuery,
        searchResults,
        handleSearch,
        handleClear,
    }
}
