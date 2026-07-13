import type { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"
import RouteBreadCrumb from "@/components/common/RouteBreadCrumb"
import PageDocLayout from "@/components/features/docs/_PageDocLayout"
import { buildDocMdxComponents } from "@/components/features/docs/doc-mdx"
import DocHeaderGroupTitle from "@/components/features/docs/DocHeaderGroupTitle"
import DocHeaderNavButtons from "@/components/features/docs/DocHeaderNavButtons"
import DocPageDropdown from "@/components/features/docs/DocPageDropdown"
import DocTableOfContent from "@/components/features/docs/DocTableOfContent"
import {
    getAllDocs,
    getCategorySlugs,
    getCodesBlock,
    getComponentSnippets,
    getDocBySlug,
    getDocNavigation,
} from "@/lib/docs"
import { importDoc } from "@/lib/import-doc"
import type { DocMeta } from "@/types/docs"

type PageProps = {
    params: Promise<{ locale: string; slug: string[] }>
}

export async function generateStaticParams() {
    return getAllDocs()
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { locale, slug } = await params
    const content = await importDoc(locale, slug)
    const { title, description, tags } = content.frontmatter as Partial<DocMeta>
    return {
        title,
        description,
        keywords: tags,
        alternates: { canonical: `/${locale}/docs/${slug.join("/")}` },
        openGraph: { title, description },
    }
}

export default async function Page({ params }: PageProps) {
    const { locale, slug } = await params
    setRequestLocale(locale)

    const { headings, rawMarkdown } = getDocBySlug(locale, slug)
    const navigation = getDocNavigation(locale, slug)
    const demoCode = getCodesBlock("src/registry/demos")
    const snippets = getComponentSnippets()
    const content = await importDoc(locale, slug)

    const mdxComponents = buildDocMdxComponents({
        locale,
        slug,
        rawMarkdown,
        frontmatter: content.frontmatter,
        demoCode,
        snippets,
    })

    return (
        <PageDocLayout
            TOCSlot={<DocTableOfContent headings={headings} />}
            topBarSlot={<RouteBreadCrumb skip={getCategorySlugs(locale)} />}
            navigationSlot={
                <>
                    <DocHeaderNavButtons navigation={navigation} />
                    <DocPageDropdown rawMarkdown={rawMarkdown} />
                </>
            }
            metadataSlot={
                <DocHeaderGroupTitle
                    showMetaTags={slug[0] === "components"}
                    meta={content.frontmatter as DocMeta}
                />
            }
            contentSlot={<content.default components={mdxComponents} />}
        />
    )
}
