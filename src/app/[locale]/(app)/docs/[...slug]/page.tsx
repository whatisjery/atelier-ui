import { setRequestLocale } from "next-intl/server"
import ButtonSideBar from "@/components/common/ButtonSideBar"
import RouteBreadCrumb from "@/components/common/RouteBreadCrumb"
import PageDocLayout from "@/components/features/docs/_PageDocLayout"
import Catalog from "@/components/features/docs/catalog/Catalog"
import CatalogNavigation from "@/components/features/docs/catalog/CatalogNavigation"
import DocCodeBlock from "@/components/features/docs/code-block/CodeBlock"
import DocHeaderGroupTitle from "@/components/features/docs/DocHeaderGroupTitle"
import DocHeaderNavButtons from "@/components/features/docs/DocHeaderNavButtons"
import DocPageDropdown from "@/components/features/docs/DocPageDropdown"
import DocTableOfContent from "@/components/features/docs/DocTableOfContent"
import DemoPreview from "@/components/features/docs/demo-preview/DemoPreview"
import InstalGuideCLI from "@/components/features/docs/install-guide/InstalGuideCLI"
import InstalGuideManual from "@/components/features/docs/install-guide/InstalGuideManual"
import ProCodeBlock from "@/components/features/pro/ProCodeBlock"
import ProLicenseHelper from "@/components/features/pro/ProLicenseHelper"
import ProPaywall from "@/components/features/pro/ProPaywall"
import {
    getAllDocs,
    getCategorySlugs,
    getCodesBlock,
    getComponentSnippets,
    getDocBySlug,
    getDocNavigation,
    getSection,
    getSectionCategories,
} from "@/lib/docs"
import { components } from "@/registry"

type PageProps = {
    params: Promise<{ locale: string; slug: string[] }>
}

export async function generateStaticParams() {
    return getAllDocs()
}

type DocMeta = { title: string; description?: string; tags?: string[] }

async function getDocMeta(locale: string, slug: string[]): Promise<DocMeta> {
    if (slug.length === 1) {
        const folder = getSection(locale, slug[0])
        if (folder) return { title: folder.title, description: folder.description }
    }

    const content = await import(`@/content/${locale}/${slug.join("/")}.mdx`)
    return content.frontmatter as DocMeta
}

export async function generateMetadata({ params }: PageProps) {
    const { locale, slug } = await params
    const { title, description, tags } = await getDocMeta(locale, slug)

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

    if (slug.length === 1) {
        const section = getSection(locale, slug[0])
        if (section) {
            const catalogItems = getSectionCategories(locale, slug[0])

            return (
                <PageDocLayout
                    topBarSlot={<ButtonSideBar />}
                    navigationSlot={<CatalogNavigation locale={locale} activeSlug={slug[0]} />}
                    contentSlot={<Catalog title={section.title} catalogItems={catalogItems} />}
                />
            )
        }
    }

    const { headings, rawMarkdown } = getDocBySlug(locale, slug)
    const navigation = getDocNavigation(locale, slug)
    const demoCode = getCodesBlock("src/registry/demos")
    const snippets = getComponentSnippets()
    const content = await import(`@/content/${locale}/${slug.join("/")}.mdx`)
    const isPro = components.some(({ name, pro }) => name === slug[slug.length - 1] && pro)

    return (
        <PageDocLayout
            TOCSlot={<DocTableOfContent headings={headings} />}
            topBarSlot={
                <div className="flex items-center">
                    <ButtonSideBar />
                    <RouteBreadCrumb skip={getCategorySlugs(locale)} />
                </div>
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
                    meta={content.frontmatter}
                />
            }
            contentSlot={
                <content.default
                    components={{
                        DemoPreview: (props: { name: string }) => {
                            return (
                                <DemoPreview
                                    {...props}
                                    codePreviewSlot={
                                        isPro ? (
                                            <ProCodeBlock
                                                name={props.name}
                                                mode="preview"
                                                showLineNumbers
                                                title={demoCode[props.name][0].path}
                                                lang={demoCode[props.name][0].extension}
                                            />
                                        ) : (
                                            <DocCodeBlock
                                                mode="preview"
                                                showLineNumbers
                                                title={demoCode[props.name][0].path}
                                                code={demoCode[props.name][0].content}
                                                lang={demoCode[props.name][0].extension}
                                            />
                                        )
                                    }
                                />
                            )
                        },

                        ProGate: ({ children }: { children: React.ReactNode }) => (
                            <ProPaywall>{children}</ProPaywall>
                        ),

                        ProLicenseHelper: () => <ProLicenseHelper />,

                        InstalGuideCLI: (props: { name: string }) => {
                            return <InstalGuideCLI {...props} />
                        },

                        InstalGuideManual: (props: { name: string }) => {
                            return <InstalGuideManual {...props} snippets={snippets[props.name]} />
                        },
                    }}
                />
            }
        />
    )
}
