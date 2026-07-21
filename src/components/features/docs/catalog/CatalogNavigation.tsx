import Link from "next/link"
import { getNavCategories } from "@/lib/docs"
import { cn } from "@/lib/utils"
import type { DocTree } from "@/types/docs"

type DocNavigationProps = {
    locale: string
    activeSlug?: string
}

function countItems(node: DocTree): number {
    if (node.type === "file") return 1
    return node.children.reduce((sum, child) => sum + countItems(child), 0)
}

export default function CatalogNavigation({ locale, activeSlug }: DocNavigationProps) {
    const categories = getNavCategories(locale)

    return (
        <nav className="h-under-nav-h flex gap-x-5 text-sm font-medium">
            {categories.map((category) => {
                const slug = category.url.split("/").pop() ?? ""
                const isActive = slug === activeSlug

                return (
                    <Link
                        key={category.url}
                        href={`/catalog/${slug}`}
                        className={cn(
                            "flex px-1 items-center border-b opacity-30 hover:opacity-100 transition-opacity duration-100 border-transparent gap-x-2",
                            {
                                "border-accent-1 opacity-100": isActive,
                            },
                        )}
                    >
                        {category.title} ({countItems(category)})
                    </Link>
                )
            })}
        </nav>
    )
}
