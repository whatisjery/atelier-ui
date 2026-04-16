"use client"

import { Hash, Search } from "lucide-react"
import { useTranslations } from "next-intl"
import { Dialog } from "radix-ui"
import { useEffect, useEffectEvent, useState } from "react"
import { useDocSearch } from "@/hooks/use-doc-search"
import { useRouter } from "@/i18n/navigation"
import { cn, truncateText } from "@/lib/utils"

const KEYBOARD_SHORTCUT = "k" as const

type GlobalSearchProps = {
    triggerSlot: ({ onClick }: { onClick: () => void }) => React.ReactNode
}

const highlightText = (text: string, query: string) => {
    if (!query) return text

    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const parts = text.split(new RegExp(`(${escaped})`, "gi"))

    return parts.map((part, index) => {
        if (part.toLowerCase() === query.toLowerCase()) {
            return (
                <mark key={index} className="bg-yellow-200">
                    {part}
                </mark>
            )
        }
        return part
    })
}

export default function GlobalSearch({ triggerSlot }: GlobalSearchProps) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [activeIndex, setActiveIndex] = useState(-1)
    const docSearch = useDocSearch()
    const t = useTranslations("common")

    const handleSelect = (slug: string) => {
        setOpen(false)
        docSearch.handleClear()
        setActiveIndex(-1)
        router.push(slug)
    }

    const handleSearch = (value: string) => {
        docSearch.handleSearch(value)
        setActiveIndex(-1)
    }

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen)
        if (!isOpen) {
            docSearch.handleClear()
            setActiveIndex(-1)
        }
    }

    const handleOpenSearch = useEffectEvent((event: KeyboardEvent) => {
        if (event.key === KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
            event.preventDefault()
            setOpen(true)
        }
    })

    const handleKeyDown = (e: React.KeyboardEvent) => {
        const results = docSearch.searchResults

        if (e.key === "ArrowDown") {
            e.preventDefault()
            setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0))
        } else if (e.key === "ArrowUp") {
            e.preventDefault()
            setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1))
        } else if (e.key === "Enter" && activeIndex >= 0 && results[activeIndex]) {
            handleSelect(results[activeIndex].slug)
        }
    }

    useEffect(() => {
        window.addEventListener("keydown", handleOpenSearch)
        return () => window.removeEventListener("keydown", handleOpenSearch)
    }, [])

    return (
        <>
            {triggerSlot?.({ onClick: () => setOpen(true) })}

            <Dialog.Root open={open} onOpenChange={handleOpenChange}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 z-20 bg-backdrop backdrop-blur-xs data-[state=open]:a-slide-in data-[state=closed]:a-slide-out" />

                    <Dialog.Content className="fixed left-1/2 max-lg:top-4 top-20 z-21 w-full -translate-x-1/2 p-3 rounded-2xl max-w-[600px] max-lg:max-w-[96%] bg-background data-[state=open]:a-slide-in data-[state=closed]:a-slide-out">
                        <Dialog.Title className="sr-only">{t("search")}</Dialog.Title>

                        <search
                            aria-label={t("search")}
                            onKeyDown={handleKeyDown}
                            className="relative flex items-center h-12"
                        >
                            <div className="pointer-events-none z-10 pl-3">
                                <Search className="size-4 text-mat-1" />
                            </div>

                            <input
                                role="combobox"
                                aria-expanded={docSearch.searchResults.length > 0}
                                value={docSearch.searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                placeholder={t("search")}
                                aria-controls="search-listbox"
                                aria-activedescendant={
                                    activeIndex >= 0 ? `search-option-${activeIndex}` : undefined
                                }
                                className="focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 border absolute inset-0 rounded-xl bg-transparent outline-none text-sm px-9"
                            />

                            <div className="pointer-events-none z-10 ml-auto pr-3">
                                <kbd className="text-xs bg-mat-4 p-1 border !rounded-md">ESC</kbd>
                            </div>
                        </search>

                        <div
                            id="search-listbox"
                            className="max-h-[calc(100vh-12rem)] overflow-y-auto"
                            role="listbox"
                            aria-label={t("search")}
                        >
                            {docSearch.searchResults.map((result, index) => (
                                <button
                                    type="button"
                                    id={`search-option-${index}`}
                                    aria-label={result.title}
                                    className={cn(
                                        "flex first:mt-3 items-center justify-start pb-3 pt-1 hover:bg-mat-5 rounded-xl cursor-pointer",
                                        { "bg-mat-4": index === activeIndex },
                                    )}
                                    key={result.slug}
                                    role="option"
                                    aria-selected={index === activeIndex}
                                    onClick={() => handleSelect(result.slug)}
                                >
                                    <Hash className="max-sm:hidden text-highlight pl-2 pr-4 size-12" />

                                    <div className="text-left">
                                        <small className="text-xs text-mat-2/70">
                                            {result.section.split("/").join(" > ")}
                                        </small>

                                        <h6 className="text-mat-1 text-sm font-medium">
                                            {highlightText(result.title, docSearch.searchQuery)}
                                        </h6>

                                        <p className="text-xs text-mat-2">
                                            {highlightText(
                                                truncateText(result.content, 150),
                                                docSearch.searchQuery,
                                            )}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </>
    )
}
