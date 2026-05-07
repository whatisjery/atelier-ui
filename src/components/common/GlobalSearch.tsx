"use client"

import { Search } from "lucide-react"
import { useTranslations } from "next-intl"
import { Dialog } from "radix-ui"
import { useState } from "react"
import { useDocSearch } from "@/hooks/use-doc-search"
import { useKeyDown } from "@/hooks/use-key-down"
import { useScrollLock } from "@/hooks/use-scroll-lock"
import { useRouter } from "@/i18n/navigation"
import { truncateText } from "@/lib/utils"
import Card from "../ui/Card"
import Input from "../ui/Input"

const KEYBOARD_SHORTCUT = "k" as const

type GlobalSearchProps = {
    triggerSlot: ({ onClick }: { onClick: () => void }) => React.ReactNode
}

function highlightText(text: string, query: string) {
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
    const tCommon = useTranslations("common")

    useScrollLock(open)

    function handleSelect(slug: string) {
        setOpen(false)
        docSearch.handleClear()
        setActiveIndex(-1)
        router.push(slug)
    }

    function handleSearch(value: string) {
        docSearch.handleSearch(value)
        setActiveIndex(-1)
    }

    function handleOpenChange(isOpen: boolean) {
        setOpen(isOpen)
        if (!isOpen) {
            docSearch.handleClear()
            setActiveIndex(-1)
        }
    }

    function handleKeyDown(e: React.KeyboardEvent) {
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

    function searchMessage() {
        const hasQuery = docSearch.searchQuery.trim().length > 0

        if (!hasQuery) return tCommon("search-empty")
        return tCommon("search-results", { count: docSearch.searchResults.length })
    }

    useKeyDown({
        key: (e) => e.key === KEYBOARD_SHORTCUT && (e.metaKey || e.ctrlKey),
        handler: (e) => {
            e.preventDefault()
            setOpen(true)
        },
    })

    return (
        <>
            {triggerSlot?.({ onClick: () => setOpen(true) })}

            <Dialog.Root open={open} onOpenChange={handleOpenChange}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 z-20 bg-backdrop backdrop-blur-sm" />
                    <Dialog.Description className="sr-only">Global search</Dialog.Description>
                    <Dialog.Content
                        asChild
                        className="data-[state=open]:a-pop-in data-[state=closed]:a-pop-out"
                    >
                        <Card className="p-5 rounded-2xl max-w-[600px] fixed left-1/2 max-lg:top-4 top-20 z-21 w-full -translate-x-1/2 max-lg:max-w-[96%] bg-bg">
                            <Dialog.Title className="sr-only">{tCommon("search")}</Dialog.Title>

                            <search
                                aria-label={tCommon("search")}
                                onKeyDown={handleKeyDown}
                                className="relative flex items-center h-12"
                            >
                                <Search className="size-4 text-accent-1 ml-3" />

                                <Input
                                    role="combobox"
                                    aria-expanded={docSearch.searchResults.length > 0}
                                    value={docSearch.searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    placeholder={tCommon("search")}
                                    aria-controls="search-listbox"
                                    aria-activedescendant={
                                        activeIndex >= 0
                                            ? `search-option-${activeIndex}`
                                            : undefined
                                    }
                                    className="absolute text-sm px-9 w-full"
                                />

                                <kbd className="pointer-events-none z-10 ml-auto mr-3 text-xs bg-accent-4 p-1 border rounded-md">
                                    ESC
                                </kbd>
                            </search>

                            <div
                                id="search-listbox"
                                className="max-h-[calc(100vh-12rem)] overflow-y-auto"
                                role="listbox"
                                aria-label={tCommon("search")}
                            >
                                {docSearch.searchResults.map((result, index) => (
                                    <button
                                        type="button"
                                        id={`search-option-${index}`}
                                        aria-label={result.title}
                                        className="text-left first:mt-3 border-b border-dashed py-3 hover:bg-accent-5 cursor-pointer"
                                        key={result.slug}
                                        role="option"
                                        aria-selected={index === activeIndex}
                                        onClick={() => handleSelect(result.slug)}
                                    >
                                        <p className="text-xs text-accent-2">{result.section}</p>

                                        <p className="text-accent-1 text-sm font-medium">
                                            {highlightText(result.title, docSearch.searchQuery)}
                                        </p>

                                        <p className="text-xs text-accent-2">
                                            {highlightText(
                                                truncateText(result.content, 150),
                                                docSearch.searchQuery,
                                            )}
                                        </p>
                                    </button>
                                ))}

                                <div className="h-10 flex items-end justify-center text-sm text-accent-2">
                                    {searchMessage()}
                                </div>
                            </div>
                        </Card>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </>
    )
}
