import { setRequestLocale } from "next-intl/server"
import PageDocLayout from "@/components/features/docs/_PageDocLayout"
import { DocCodeBlock } from "@/components/features/docs/DocCodeBlock"
import DocComponentPreview from "@/components/features/docs/DocComponentPreview"
import DocHeaderGroupTitle from "@/components/features/docs/DocHeaderGroupTitle"
import DocInstallGuide from "@/components/features/docs/DocInstallGuide"
import DocPageDropdown from "@/components/features/docs/DocPageDropdown"
import DocPagination from "@/components/features/docs/DocPagination"
import DocTableOfContent from "@/components/features/docs/DocTableOfContent"
import ProLicenseHelper from "@/components/features/pro/ProLicenseHelper"
import ProPaywall from "@/components/features/pro/ProPaywall"
import { getAllDocs, getCodesBlock, getDocBySlug, getDocNavigation } from "@/lib/docs"
import { getPolarCustomer } from "@/lib/polar"
import { getComponentSnippets } from "@/lib/registry"
import { components } from "@/registry"

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
    const customer = await getPolarCustomer()

    setRequestLocale(locale)

    const { headings, rawMarkdown } = getDocBySlug(locale, slug)
    const navigation = getDocNavigation(locale, slug)
    const demoCode = getCodesBlock("src/registry/demos")
    const snippets = getComponentSnippets()
    const content = await import(`@/content/${locale}/${slug.join("/")}.mdx`)
    const isProComponent = components.some((c) => c.name === slug[slug.length - 1] && c.pro)

    const getDemoComponent = (name: string) => {
        return components.find((component) => name.replace("-demo", "") === component.name)
    }

    return (
        <PageDocLayout
            bottomSlot={navigation ? <DocPagination navigation={navigation} /> : undefined}
            TOCSlot={<DocTableOfContent showCommunityLinks={!isProComponent} headings={headings} />}
            headerSlot={
                <DocHeaderGroupTitle
                    headerSlot={!isProComponent && <DocPageDropdown rawMarkdown={rawMarkdown} />}
                    meta={content.frontmatter}
                />
            }
            contentSlot={
                <content.default
                    components={{
                        DocComponentPreview: (props: { name: string }) => {
                            const component = getDemoComponent(props.name)
                            const hasR3f = component?.dependencies.includes("@react-three/drei")

                            return (
                                <DocComponentPreview
                                    {...props}
                                    isSourceCodeDisabled={customer === null && isProComponent}
                                    dreiLoader={hasR3f ?? false}
                                    codePreviewSlot={
                                        <DocCodeBlock
                                            title={demoCode[props.name][0].path}
                                            code={demoCode[props.name][0].content}
                                            lang={demoCode[props.name][0].extension}
                                        />
                                    }
                                />
                            )
                        },

                        ProGate: ({ children }: { children: React.ReactNode }) => {
                            if (customer !== null) return children
                            return <ProPaywall />
                        },

                        ProLicenseHelper: () => {
                            return <ProLicenseHelper licenseKey={customer?.licenseKey ?? ""} />
                        },

                        DocInstallGuide: (props: { name: string }) => {
                            return <DocInstallGuide {...props} snippets={snippets[props.name]} />
                        },
                    }}
                />
            }
        />
    )
}
