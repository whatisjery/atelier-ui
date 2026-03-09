import { setRequestLocale } from "next-intl/server"
import PageDocLayout from "@/components/features/docs/_PageDocLayout"
import DocComponentList from "@/components/features/docs/DocComponentList"
import DocHeaderGroupTitle from "@/components/features/docs/DocHeaderGroupTitle"
import DocTableOfContent from "@/components/features/docs/DocTableOfContent"
import { routing } from "@/i18n/routing"
import { getComponentsList, getDocBySlug } from "@/lib/docs"

type PageProps = {
    params: Promise<{ locale: string }>
}

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: PageProps) {
    const { locale } = await params

    const content = await import(`@/content/${locale}/components/index.mdx`)
    return {
        title: content.frontmatter.title,
        description: content.frontmatter.description,
    }
}

export default async function Page({ params }: PageProps) {
    const { locale } = await params
    setRequestLocale(locale)

    const { headings } = getDocBySlug(locale, ["components/index"])

    const content = await import(`@/content/${locale}/components/index.mdx`)

    const componentsList = getComponentsList(locale)

    return (
        <PageDocLayout
            headerSlot={
                <DocHeaderGroupTitle
                    className="mb-15"
                    showBreadcrumb={false}
                    meta={content.frontmatter}
                />
            }
            TOCSlot={<DocTableOfContent headings={headings} />}
            contentSlot={
                <content.default
                    components={{
                        DocComponentList: () => {
                            return <DocComponentList componentsList={componentsList} />
                        },
                    }}
                />
            }
        />
    )
}
