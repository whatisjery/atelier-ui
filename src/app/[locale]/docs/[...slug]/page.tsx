import PageDocLayout from "@/components/features/docs/_PageDocLayout"
import DocComponentPreview from "@/components/features/docs/DocComponentPreview"
import DocHeaderGroupTitle from "@/components/features/docs/DocHeaderGroupTitle"
import DocInstallGuide from "@/components/features/docs/DocInstallGuide"
import DocPageDropdown from "@/components/features/docs/DocPageDropdown"
import DocPagination from "@/components/features/docs/DocPagination"
import DocTableOfContent from "@/components/features/docs/DocTableOfContent"
import { getAllDocs, getCodesBlock, getDocBySlug, getDocNavigation } from "@/lib/docs"

type PageProps = {
    params: Promise<{ locale: string; slug: string[] }>
}

export async function generateStaticParams() {
    return getAllDocs()
}

export async function generateMetadata({ params }: PageProps) {
    const { locale, slug } = await params
    const content = await import(`@/content/${locale}/${slug.join("/")}.mdx`)
    return {
        title: content.frontmatter.title,
        description: content.frontmatter.description,
    }
}

export default async function Page({ params }: PageProps) {
    const { locale, slug } = await params

    const { headings, rawMarkdown } = getDocBySlug(locale, slug)
    const navigation = getDocNavigation(locale, slug)

    const demoCode = getCodesBlock("src/registry/demos")
    const baseCode = getCodesBlock("src/registry/base")
    const content = await import(`@/content/${locale}/${slug.join("/")}.mdx`)

    return (
        <PageDocLayout
            bottomSlot={navigation ? <DocPagination navigation={navigation} /> : undefined}
            TOCSlot={headings ? <DocTableOfContent headings={headings} /> : undefined}
            headerSlot={
                <DocHeaderGroupTitle
                    headerSlot={<DocPageDropdown rawMarkdown={rawMarkdown} />}
                    meta={content.frontmatter}
                />
            }
            contentSlot={
                <content.default
                    components={{
                        DocComponentPreview: (props: { name: string }) => {
                            return (
                                <DocComponentPreview
                                    {...props}
                                    snippets={demoCode[props.name][0]}
                                />
                            )
                        },
                        DocInstallGuide: (props: { name: string }) => {
                            return <DocInstallGuide {...props} snippets={baseCode[props.name]} />
                        },
                    }}
                />
            }
        />
    )
}
