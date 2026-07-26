import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"
import yaml from "js-yaml"
import { notFound } from "next/navigation"
import { cache } from "react"
import { visit } from "unist-util-visit"
import { routing } from "@/i18n/routing"
import { resolveTransitiveDependencies } from "@/lib/resolve-dependencies"
import { overlayRoots, resolveOverlayPath } from "@/lib/roots"
import videoManifestJson from "@/lib/video-manifest.json"
import { components } from "@/registry"
import type { CodeFile } from "@/types/code"
import type { DirMeta, DocNavigation, DocTree } from "@/types/docs"
import type { TOCItem } from "@/types/toc"
import { getDocStatus, slugify } from "./utils"

const videoManifest: Record<string, string> = videoManifestJson

const DOCS_DIR = "src/content"
const HEADING_REGEX = /^(#{2,3})\s+(.+)$/gm
const TEXT_EXTENSIONS = ["ts", "tsx", "js", "jsx", "css", "json"]

export const getDocsTree = cache(function getDocsTree(locale: string): DocTree[] {
    const trees = overlayRoots(path.join(DOCS_DIR, locale)).map((dir) => buildDocTree(dir, "/docs"))
    return trees.reduce(mergeDocTrees, [])
})

function mergeDocTrees(base: DocTree[], overlay: DocTree[]): DocTree[] {
    const merged = [...base]
    for (const node of overlay) {
        const index = merged.findIndex((item) => item.url === node.url)
        const existing = index === -1 ? undefined : merged[index]
        if (existing && existing.type === "folder" && node.type === "folder") {
            existing.children = mergeDocTrees(existing.children, node.children).sort(
                (a, b) => a.order - b.order,
            )
        } else if (existing && existing.type === "file" && node.type === "file") {
            merged[index] = node
        } else if (!existing) {
            merged.push(node)
        }
    }
    return merged.sort((a, b) => a.order - b.order)
}

export function getDocNavigation(locale: string, currentSlug: string[]): DocNavigation {
    const flatDocs: { title: string; url: string; description: string }[] = []
    for (const root of getDocsTree(locale)) {
        visit(root, (node) => {
            if (node.type === "file") {
                flatDocs.push({
                    title: node.title,
                    url: node.url,
                    description: node.description ?? "",
                })
            }
        })
    }

    const currentUrl = `/docs/${currentSlug.join("/")}`
    const currentIndex = flatDocs.findIndex((doc) => doc.url === currentUrl)

    return {
        prev: currentIndex > 0 ? flatDocs[currentIndex - 1] : null,
        next: currentIndex < flatDocs.length - 1 ? flatDocs[currentIndex + 1] : null,
    }
}

export function getCodesBlock(strPath: string): Record<string, CodeFile[]> {
    const codes: Record<string, CodeFile[]> = {}

    for (const dirPath of overlayRoots(strPath)) {
        const dirs = fs.readdirSync(dirPath, { withFileTypes: true }).filter((e) => e.isDirectory())
        for (const entry of dirs) {
            const folderPath = path.join(dirPath, entry.name)
            const files = fs.readdirSync(folderPath).filter((file) => file !== "controls.ts")
            codes[entry.name] = files.map((file) => ({
                content: fs.readFileSync(path.join(folderPath, file), "utf-8"),
                filename: file,
                extension: path.extname(file).slice(1),
                path: file,
            }))
        }
    }
    return codes
}

export function getDocBySlug(
    locale: string,
    slug: string[],
): { headings: TOCItem[]; rawMarkdown: string } {
    const relPath = path.join(locale, `${slug.join("/")}.mdx`)
    const filePath = resolveOverlayPath(path.join(DOCS_DIR, relPath))
    if (!filePath) notFound()
    const fileContent = fs.readFileSync(filePath, "utf-8")
    const { content: rawMarkdown } = matter(fileContent)

    const headings: TOCItem[] = Array.from(rawMarkdown.matchAll(HEADING_REGEX), (match) => {
        return {
            id: slugify(match[2].trim()),
            text: match[2].trim(),
            level: match[1].length,
        }
    })

    return { headings, rawMarkdown }
}

export function getAllDocs() {
    const result: { locale: string; slug: string[] }[] = []
    for (const locale of routing.locales) {
        for (const root of getDocsTree(locale)) {
            visit(root, (node) => {
                const slug = node.url.replace("/docs/", "").split("/")
                if (slug[0] && node.type === "file") {
                    result.push({ locale, slug })
                }
            })
        }
    }
    return result
}

function buildFolderNode(fullPath: string, urlPath: string, item: string): DocTree {
    const ymlPath = path.join(fullPath, "_dir.yml")
    let dirMeta: Partial<DirMeta> = {}

    if (fs.existsSync(ymlPath)) {
        dirMeta = yaml.load(fs.readFileSync(ymlPath, "utf-8")) as Partial<DirMeta>
    }

    return {
        type: "folder",
        url: `${urlPath}/${item}`,
        children: buildDocTree(fullPath, `${urlPath}/${item}`),
        title: dirMeta.title || item,
        order: dirMeta.order ?? Number.MAX_SAFE_INTEGER,
        category: dirMeta.category,
        icon: dirMeta.icon,
        nav: dirMeta.nav,
        navOrder: dirMeta.navOrder,
        display: dirMeta.display,
    }
}

function buildFileNode(fullPath: string, urlPath: string, item: string): DocTree {
    const slug = item.replace(".mdx", "")
    const fileContents = fs.readFileSync(fullPath, "utf-8")
    const { data } = matter(fileContents)
    const { createdAt, updatedAt } = data

    return {
        type: "file",
        url: slug === "index" ? urlPath : `${urlPath}/${slug}`,
        children: [],
        title: data.title || slug,
        description: data.description,
        icon: data.icon,
        order: data.order ?? Number.MAX_SAFE_INTEGER,
        tags: data.tags,
        createdAt: createdAt ?? undefined,
        updatedAt: updatedAt ?? undefined,
        tag: data.tag,
        hidden: data.hidden,
        preview: videoManifest[slug],
    }
}

function buildDocTree(dirPath: string, urlPath: string): DocTree[] {
    const result: DocTree[] = []
    for (const item of fs.readdirSync(dirPath)) {
        const fullPath = path.join(dirPath, item)
        const stat = fs.statSync(fullPath)

        if (stat.isDirectory()) {
            const folder = buildFolderNode(fullPath, urlPath, item)
            if (folder.children.length > 0 || folder.nav) result.push(folder)
        } else if (item.endsWith(".mdx")) {
            result.push(buildFileNode(fullPath, urlPath, item))
        }
    }
    return result.filter((node) => !node.hidden).sort((a, b) => a.order - b.order)
}

export function getNewDocs(locale: string): DocTree[] {
    const flatten = (nodes: DocTree[]): DocTree[] =>
        nodes.flatMap((node) => (node.type === "file" ? [node] : flatten(node.children)))

    return flatten(getDocsTree(locale))
        .filter((node) => getDocStatus(node.createdAt) === "new")
        .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
}

export function getSection(locale: string, slug: string): DocTree | undefined {
    const tree = getDocsTree(locale)
    return tree.find((doc) => doc.url === `/docs/${slug}`)
}

export function getNavCategories(locale: string): DocTree[] {
    const tree = getDocsTree(locale)
    return tree
        .filter((node) => node.type === "folder" && node.nav)
        .sort((a, b) => (a.navOrder ?? a.order) - (b.navOrder ?? b.order))
}

export function getSectionCategories(locale: string, slug: string): DocTree[] {
    const folder = getSection(locale, slug)
    if (!folder) return []
    const categories = folder.children.filter((item) => item.type === "folder")
    return categories.length > 0 ? categories : [folder]
}

export const getComponentSnippets = cache(function getComponentSnippets(): Record<
    string,
    CodeFile[]
> {
    const baseCode = getCodesBlock("src/registry/base")
    const snippets: Record<string, CodeFile[]> = {}

    for (const component of components) {
        const resolved = resolveTransitiveDependencies(component.name)

        const shared = resolved.shared
            .filter((dep) => TEXT_EXTENSIONS.includes(path.extname(dep).slice(1)))
            .map((dep) => {
                const fullPath = resolveOverlayPath(path.join("src/registry", dep))
                if (!fullPath) throw new Error(`missing shared registry file "${dep}"`)
                const file = path.basename(dep)
                return {
                    content: fs.readFileSync(fullPath, "utf-8"),
                    filename: file,
                    extension: path.extname(file).slice(1),
                    path: file,
                }
            })

        const registryDeps = resolved.registryDependencies.flatMap((name) => baseCode[name] ?? [])

        snippets[component.name] = [...(baseCode[component.name] ?? []), ...shared, ...registryDeps]
    }

    return snippets
})

export const getCategorySlugs = cache(function getCategorySlugs(locale: string): string[] {
    const slugs: string[] = []
    for (const root of getDocsTree(locale)) {
        visit(root, (node) => {
            if (node.type === "folder" && node.category && node.display !== "folder") {
                const last = node.url.split("/").pop()
                if (last) slugs.push(last)
            }
        })
    }
    return slugs
})
