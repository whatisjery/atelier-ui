import { notFound } from "next/navigation"
import { hasLocale } from "next-intl"
import { setRequestLocale } from "next-intl/server"
import MainNav from "@/components/common/MainNav"
import SideBar from "@/components/features/docs/side-bar/SideBar"
import { routing } from "@/i18n/routing"
import { getDocsTree } from "@/lib/docs"

type CatalogLayoutProps = {
    children: React.ReactNode
    params: Promise<{ locale: string }>
}

export default async function CatalogLayout({ children, params }: CatalogLayoutProps) {
    const { locale } = await params
    setRequestLocale(locale)

    if (!hasLocale(routing.locales, locale)) {
        notFound()
    }

    const sections = getDocsTree(locale)

    return (
        <div className="mx-auto w-full relative flex flex-col">
            <MainNav />

            <div className="flex">
                <SideBar sections={sections} />
                {children}
            </div>
        </div>
    )
}
