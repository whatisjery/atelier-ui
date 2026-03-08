import PageLanding from "@/components/features/landing/_PageLanding"
import { getComponentsList } from "@/lib/docs"

const SHOWCASE_COUNT = 6

type PageProps = {
    params: Promise<{ locale: string }>
}

export default async function Page({ params }: PageProps) {
    const { locale } = await params

    const components = getComponentsList(locale).flatMap(({ children, icon }) => {
        return children.map((child) => ({ ...child, icon: icon }))
    })

    const activeComponents = components.filter((component) => !component.placeholder)

    /*
     * only show the first 6 active components in the showcase carousel
     * if there are less than 6 active components, show all of them
     */
    const showcaseComponents = Array.from(
        { length: SHOWCASE_COUNT },
        (_, i) => activeComponents[i % activeComponents.length],
    )

    return (
        <PageLanding activeComponents={activeComponents} showcaseComponents={showcaseComponents} />
    )
}
