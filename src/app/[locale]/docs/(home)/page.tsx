import ScrollableTechStack from "@/components/common/ScrollableTechStack"
import PageDocLayout from "@/components/features/docs/_PageDocLayout"
import DocHeaderGroupTitle from "@/components/features/docs/DocHeaderGroupTitle"
import DocQuickLinks from "@/components/features/docs/DocQuickLinks"
import DocTableOfContent from "@/components/features/docs/DocTableOfContent"
import { routing } from "@/i18n/routing"
import { getDocBySlug, getQuickLinksMeta } from "@/lib/docs"

type PageProps = {
    params: Promise<{ locale: string }>
}

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: PageProps) {
    const { locale } = await params
    const content = await import(`@/content/${locale}/index.mdx`)
    return {
        title: content.frontmatter.title,
        description: content.frontmatter.description,
    }
}

export default async function Page({ params }: PageProps) {
    const { locale } = await params

    const content = await import(`@/content/${locale}/index.mdx`)

    const { headings } = getDocBySlug(locale, ["index"])

    const quickLinks = getQuickLinksMeta(locale, [
        "components/index",
        "getting-started/installation",
        "getting-started/contribution",
        "getting-started/code-of-conduct",
    ])

    return (
        <PageDocLayout
            TOCSlot={<DocTableOfContent headings={headings} />}
            headerSlot={
                <DocHeaderGroupTitle
                    className="-mb-3"
                    showBreadcrumb={false}
                    meta={content.frontmatter}
                />
            }
            contentSlot={
                <>
                    <ScrollableTechStack />
                    <content.default
                        components={{
                            DocQuickLinks: () => {
                                return <DocQuickLinks links={quickLinks} />
                            },
                        }}
                    />
                </>
            }
        />
    )
}
