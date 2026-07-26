import type { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"
import RouteBreadCrumb from "@/components/common/RouteBreadCrumb"
import PageDocLayout from "@/components/features/docs/_PageDocLayout"
import DocHeaderGroupTitle from "@/components/features/docs/DocHeaderGroupTitle"
import DocHeaderNavButtons from "@/components/features/docs/DocHeaderNavButtons"
import DocPageDropdown from "@/components/features/docs/DocPageDropdown"
import DocTableOfContent from "@/components/features/docs/DocTableOfContent"
import { buildDemoPreview, buildDocMdxComponents } from "@/components/features/docs/doc-mdx"
import {
    getAllDocs,
    getCategorySlugs,
    getCodesBlock,
    getComponentSnippets,
    getDocBySlug,
    getDocNavigation,
    getNavCategories,
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
    const hrefOverrides = Object.fromEntries(
        getNavCategories(locale).map((section) => [
            section.url,
            section.url.replace("/docs/", "/catalog/"),
        ]),
    )
    const demoCode = getCodesBlock("src/registry/demos")
    const snippets = getComponentSnippets()
    const content = await importDoc(locale, slug)

    const mdxContext = {
        locale,
        slug,
        rawMarkdown,
        frontmatter: content.frontmatter,
        demoCode,
        snippets,
    }

    const mdxComponents = buildDocMdxComponents(mdxContext)
    const demoSlot = buildDemoPreview(mdxContext)

    return (
        <PageDocLayout
            demoSlot={demoSlot}
            TOCSlot={demoSlot ? undefined : <DocTableOfContent headings={headings} />}
            topBarSlot={
                <RouteBreadCrumb skip={getCategorySlugs(locale)} hrefOverrides={hrefOverrides} />
            }
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
