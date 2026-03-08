import fs from "node:fs"
import path from "node:path"
import { glob } from "fast-glob"
import matter from "gray-matter"
import yaml from "js-yaml"
import { cache } from "react"
import type { CodeFile } from "@/types/code"
import type { DocComponentStatus, DocNavigation, DocTree, QuickLink } from "@/types/docs"
import type { TOCItem } from "@/types/toc"
import { GIT_DAYS_THRESHOLD } from "./constants"
import { getFileGitDates } from "./git"

const docsDirectory = path.join(process.cwd(), "src/content")
const MS_PER_DAY = 24 * 60 * 60 * 1000

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

function getDirMeta(dirPath: string) {
    const ymlPath = path.join(dirPath, "_dir.yml")

    const defaultMeta = {
        type: "folder",
        url: "",
        children: [],
        title: "",
        description: "",
        category: "",
        order: Infinity,
        icon: undefined,
        tags: [],
    }

    if (fs.existsSync(ymlPath)) {
        const content = fs.readFileSync(ymlPath, "utf-8")
        return { ...defaultMeta, ...(yaml.load(content) as DocTree) }
    }
    return defaultMeta
}

export function getDocNavigation(locale: string, currentSlug: string[]): DocNavigation {
    const tree = getDocsTree(locale)
    const flatDocs: { title: string; url: string; description: string; disabled: boolean }[] = []

    const flatten = (nodes: DocTree[]) => {
        for (const node of nodes) {
            if (node.title === "index") continue
            if (node.type === "file") {
                flatDocs.push({
                    title: node.title,
                    url: node.url,
                    description: node.description,
                    disabled: node.placeholder ?? false,
                })
            }
            if (node.children.length > 0) {
                flatten(node.children)
            }
        }
    }

    flatten(tree)

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
    const filePath = path.join(docsDirectory, locale, `${slug.join("/")}.mdx`)
    const fileContent = fs.readFileSync(filePath, "utf-8")
    const { content: mdxContent } = matter(fileContent)

    const headings: (TOCItem & { _pos: number })[] = []
    let match: RegExpExecArray | null
    const headingRegex = /^(#{2,3})\s+(.+)$/gm
    match = headingRegex.exec(mdxContent)
    while (match !== null) {
        const text = match[2].trim()
        headings.push({
            id: text.toLowerCase().replace(/\s+/g, "-"),
            text,
            level: match[1].length,
            _pos: match.index,
        })
        match = headingRegex.exec(mdxContent)
    }

    const stepRegex = /<DocStep\s[^>]*title="([^"]+)"/g
    match = stepRegex.exec(mdxContent)
    while (match !== null) {
        const text = match[1].trim()
        headings.push({
            id: text.toLowerCase().replace(/\s+/g, "-"),
            text,
            level: 3,
            _pos: match.index,
        })
        match = stepRegex.exec(mdxContent)
    }

    headings.sort((a, b) => a._pos - b._pos)

    return {
        headings: headings.map(({ _pos, ...rest }) => rest),
        rawMarkdown: mdxContent,
    }
}

export function getAllDocs() {
    const files = glob.sync("src/content/**/*.mdx")

    return files.map((file) => {
        const parts = file.replace("src/content/", "").replace(".mdx", "").split("/")

        return {
            locale: parts[0],
            slug: parts.slice(1),
        }
    })
}

export function getQuickLinksMeta(locale: string, slugs: string[]): QuickLink[] {
    return slugs.map((slug) => {
        const filePath = path.join(process.cwd(), "src/content", locale, `${slug}.mdx`)
        const fileContent = fs.readFileSync(filePath, "utf-8")
        const { data } = matter(fileContent)

        return {
            title: data.title,
            href: `/docs/${slug.replace(/\/index$/, "")}`,
            icon: data.icon,
            description: data.description,
            tags: data.tags,
        }
    })
}

function walkDir(dirPath: string, urlPath: string): DocTree[] {
    const items = fs.readdirSync(dirPath)
    const result: DocTree[] = []

    for (const item of items) {
        const fullPath = path.join(dirPath, item)
        const stat = fs.statSync(fullPath)

        if (stat.isDirectory()) {
            const dirMeta = getDirMeta(fullPath)

            result.push({
                type: "folder",
                url: `${urlPath}/${item}`,
                children: walkDir(fullPath, `${urlPath}/${item}`),
                title: dirMeta.title || item,
                description: dirMeta.description,
                category: dirMeta.category,
                order: dirMeta.order,
                icon: dirMeta.icon,
                tags: dirMeta.tags,
            })
        } else if (item.endsWith(".mdx")) {
            const slug = item.replace(".mdx", "")
            const fileContents = fs.readFileSync(fullPath, "utf-8")
            const { data } = matter(fileContents)

            function getBadgeTypeFromData() {
                if (data.placeholder) return undefined
                return getComponentStatus(fullPath) || undefined
            }

            result.push({
                type: "file",
                url: slug === "index" ? urlPath : `${urlPath}/${slug}`,
                children: [],
                title: data.title || slug,
                description: data.description,
                icon: data.icon,
                order: data.order,
                tags: data.tags,
                placeholder: data.placeholder,
                status: getBadgeTypeFromData(),
            })
        }
    }

    return result.sort((a, b) => a.order - b.order)
}

export const getDocsTree = cache(function getDocsTree(locale: string): DocTree[] {
    const docDir = path.join(docsDirectory, locale)
    return walkDir(docDir, "/docs")
})

export function getComponentsList(locale: string): DocTree[] {
    const tree = getDocsTree(locale)
    const componentsFolder = tree.find((doc) => doc.url === "/docs/components")
    return componentsFolder?.children.filter((item) => item.type === "folder") ?? []
}

export function getSidebarData(locale: string) {
    const tree = getDocsTree(locale)

    const menuSections: DocTree[] = []
    for (const item of tree) {
        if (!item.children.length) continue
        const hasSubfolders = item.children.some((c) => c.children?.length)
        if (hasSubfolders) {
            menuSections.push(...item.children.filter((c) => c.children?.length))
        } else {
            menuSections.push(item)
        }
    }

    return { menuSections }
}
