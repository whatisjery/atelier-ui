import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"
import yaml from "js-yaml"
import { cache } from "react"
import { visit } from "unist-util-visit"
import { routing } from "@/i18n/routing"
import { components } from "@/registry"
import type { CodeFile } from "@/types/code"
import type { DirMeta, DocComponentStatus, DocNavigation, DocTree } from "@/types/docs"
import type { TOCItem } from "@/types/toc"
import { GIT_DAYS_THRESHOLD } from "./constants"
import { getFileGitDates } from "./git"
import { slugify } from "./utils"

const DOCS_DIR = path.join(process.cwd(), "src/content")
const MS_PER_DAY = 24 * 60 * 60 * 1000
const HEADING_REGEX = /^(#{2,3})\s+(.+)$/gm
const TEXT_EXTENSIONS = ["ts", "tsx", "js", "jsx", "css", "json"]
const REGISTRY_DIR = path.join(process.cwd(), "src/registry")

export const getDocsTree = cache(function getDocsTree(locale: string): DocTree[] {
    const docDir = path.join(DOCS_DIR, locale)
    return buildDocTree(docDir, "/docs")
})

export function getComponentStatus(filePath: string): DocComponentStatus | undefined {
    const { createdAt, updatedAt } = getFileGitDates(filePath)
    if (!createdAt) return undefined

    const now = Date.now()
    const daysSinceCreated = (now - createdAt.getTime()) / MS_PER_DAY
    const daysSinceUpdated = updatedAt ? (now - updatedAt.getTime()) / MS_PER_DAY : Infinity

    if (daysSinceCreated < GIT_DAYS_THRESHOLD) return "new"
    if (daysSinceUpdated < GIT_DAYS_THRESHOLD && createdAt.getTime() !== updatedAt?.getTime())
        return "update"

    return undefined
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
    const dirPath = path.join(process.cwd(), strPath)
    const codes: Record<string, CodeFile[]> = {}

    const entries = fs.readdirSync(dirPath, { withFileTypes: true })

    for (const entry of entries) {
        if (entry.isDirectory()) {
            const folderPath = path.join(dirPath, entry.name)
            const files = fs.readdirSync(folderPath)
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
    const filePath = path.join(DOCS_DIR, locale, `${slug.join("/")}.mdx`)
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
                if (slug[0] && (node.type === "file" || slug.length === 1)) {
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
    }
}

function buildFileNode(fullPath: string, urlPath: string, item: string): DocTree {
    const slug = item.replace(".mdx", "")
    const fileContents = fs.readFileSync(fullPath, "utf-8")
    const { data } = matter(fileContents)
    const isPro = components.some((component) => component.name === slug && component.pro)

    return {
        type: "file",
        url: slug === "index" ? urlPath : `${urlPath}/${slug}`,
        children: [],
        title: data.title || slug,
        description: data.description,
        icon: data.icon,
        order: data.order ?? Number.MAX_SAFE_INTEGER,
        tags: data.tags,
        status: getComponentStatus(fullPath),
        pro: isPro,
    }
}

function buildDocTree(dirPath: string, urlPath: string): DocTree[] {
    const result: DocTree[] = []
    for (const item of fs.readdirSync(dirPath)) {
        const fullPath = path.join(dirPath, item)
        const stat = fs.statSync(fullPath)

        if (stat.isDirectory()) {
            const folder = buildFolderNode(fullPath, urlPath, item)
            if (folder.children.length > 0) result.push(folder)
        } else if (item.endsWith(".mdx")) {
            result.push(buildFileNode(fullPath, urlPath, item))
        }
    }
    return result.sort((a, b) => a.order - b.order)
}

export function getSection(locale: string, slug: string): DocTree | undefined {
    const tree = getDocsTree(locale)
    return tree.find((doc) => doc.url === `/docs/${slug}`)
}

export function getNavCategories(locale: string): DocTree[] {
    const tree = getDocsTree(locale)
    return tree.filter((node) => node.type === "folder" && node.nav)
}

export function getSectionCategories(locale: string, slug: string): DocTree[] {
    const folder = getSection(locale, slug)
    return folder?.children.filter((item) => item.type === "folder") ?? []
}

export const getComponentSnippets = cache(function getComponentSnippets(): Record<
    string,
    CodeFile[]
> {
    const baseCode = getCodesBlock("src/registry/base")
    const snippets: Record<string, CodeFile[]> = {}

    for (const component of components) {
        const shared = component.shared
            .filter((dep) => TEXT_EXTENSIONS.includes(path.extname(dep).slice(1)))
            .map((dep) => {
                const fullPath = path.join(REGISTRY_DIR, dep)
                const file = path.basename(dep)
                return {
                    content: fs.readFileSync(fullPath, "utf-8"),
                    filename: file,
                    extension: path.extname(file).slice(1),
                    path: file,
                }
            })

        const registryDeps = component.registryDependencies.flatMap((name) => baseCode[name] ?? [])

        snippets[component.name] = [...(baseCode[component.name] ?? []), ...shared, ...registryDeps]
    }

    return snippets
})

export const getCategorySlugs = cache(function getCategorySlugs(locale: string): string[] {
    const slugs: string[] = []
    for (const root of getDocsTree(locale)) {
        visit(root, (node) => {
            if (node.type === "folder" && node.category) {
                const last = node.url.split("/").pop()
                if (last) slugs.push(last)
            }
        })
    }
    return slugs
})
