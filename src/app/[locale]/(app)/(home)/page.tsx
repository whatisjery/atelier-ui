import { setRequestLocale } from "next-intl/server"
import PageLanding from "@/components/features/landing/_PageLanding"
import { getSectionCategories } from "@/lib/docs"

const SHOWCASE_COUNT = 6

type PageProps = {
    params: Promise<{ locale: string }>
}

export default async function Page({ params }: PageProps) {
    const { locale } = await params
    setRequestLocale(locale)

    const components = getSectionCategories(locale, "components").flatMap(({ children, icon }) => {
        return children.map((child) => ({ ...child, icon: icon }))
    })

    /*
     * only show the first 6 active components in the showcase carousel
     * if there are less than 6 active components, show all of them
     */
    const showcaseComponents = Array.from(
        { length: SHOWCASE_COUNT },
        (_, i) => components[i % components.length],
    )

    return <PageLanding showcaseComponents={showcaseComponents} />
}
