import { notFound } from "next/navigation"

export type DocModule = {
    default: React.ComponentType<{ components?: Record<string, React.ComponentType> }>
    frontmatter: Record<string, unknown>
}

/*
 * Deployments that overlay extra content trees provide their own copy of
 * this module trying their trees first, which is why the import below is
 * relative: it must always target this checkout's content directory.
 */
export async function tryImportDoc(locale: string, slug: string[]): Promise<DocModule | null> {
    try {
        return (await import(`../content/${locale}/${slug.join("/")}.mdx`)) as DocModule
    } catch {
        return null
    }
}

export async function importDoc(locale: string, slug: string[]): Promise<DocModule> {
    const doc = await tryImportDoc(locale, slug)
    if (!doc) notFound()
    return doc
}
