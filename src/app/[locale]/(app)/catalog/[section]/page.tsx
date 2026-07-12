import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import Catalog from "@/components/features/docs/catalog/Catalog"
import CatalogNavigation from "@/components/features/docs/catalog/CatalogNavigation"
import DocFooter from "@/components/features/docs/DocFooter"
import { routing } from "@/i18n/routing"
import { getNavCategories, getSection, getSectionCategories } from "@/lib/docs"

type PageProps = {
    params: Promise<{ locale: string; section: string }>
}

function sectionSlug(url: string) {
    return url.split("/").pop() ?? ""
}

export function generateStaticParams() {
    return routing.locales.flatMap((locale) =>
        getNavCategories(locale).map((category) => ({ section: sectionSlug(category.url) })),
    )
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { locale, section } = await params
    const folder = getSection(locale, section)
    if (!folder) return {}

    return {
        title: folder.title,
        description: folder.description,
        alternates: { canonical: `/${locale}/catalog/${section}` },
        openGraph: { title: folder.title, description: folder.description },
    }
}

export default async function CatalogPage({ params }: PageProps) {
    const { locale, section } = await params
    setRequestLocale(locale)

    const folder = getSection(locale, section)
    if (!folder) notFound()

    const catalogItems = getSectionCategories(locale, section).filter(
        (item) => !item.url.endsWith("/primitive"),
    )
    const facetByTag = folder.children.every((child) => child.type === "file")

    return (
        <div className="flex flex-col min-w-0 w-full">
            <header className="sticky top-sticky z-3 flex items-center h-under-nav-h w-full border-b bg-bg px-5">
                <CatalogNavigation locale={locale} activeSlug={section} />
            </header>

            <main className="w-full min-h-screen pb-50 px-5">
                <Catalog facetByTag={facetByTag} catalogItems={catalogItems} />
            </main>

            <footer className="w-full border-t h-30 sm:h-nav-h bg-bg z-2">
                <DocFooter className="px-5" />
            </footer>
        </div>
    )
}
