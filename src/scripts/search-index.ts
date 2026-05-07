import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"
import yaml from "js-yaml"
import type { Heading, InlineCode, Root, Text } from "mdast"
import { remark } from "remark"
import remarkGfm from "remark-gfm"
import remarkMdx from "remark-mdx"
import type { Node } from "unist"
import { SKIP, visit } from "unist-util-visit"
import type { SearchEntry } from "@/types/scripts"

function getSectionTitle(dir: string): string {
    const ymlPath = path.join(dir, "_dir.yml")
    if (!fs.existsSync(ymlPath)) return ""
    const meta = yaml.load(fs.readFileSync(ymlPath, "utf-8"))
    const title = (meta as { title?: unknown }).title
    if (typeof title === "string") return title
    return ""
}

function extractText(content: string): string {
    const tree = remark().use(remarkMdx).use(remarkGfm).parse(content) as Root
    const textParts: string[] = []

    visit(tree, (node: Node) => {
        if (node.type === "tableCell") {
            visit(node, "text", (textNode: Text) => {
                textParts.push(textNode.value)
            })
            return SKIP
        }

        if (node.type === "text") {
            textParts.push((node as Text).value)
        }

        if (node.type === "inlineCode") {
            textParts.push((node as InlineCode).value)
        }
    })

    return textParts.join(" ").replace(/\s+/g, " ").trim()
}

function extractHeadings(content: string): string[] {
    const tree = remark().use(remarkMdx).parse(content) as Root

    const headings: string[] = []

    visit(tree, "heading", (node: Heading) => {
        const text = node.children
            .filter((child): child is Text => child.type === "text")
            .map((child) => child.value)
            .join("")
        if (text) headings.push(text)
    })

    return headings
}

function walk(dir: string, entries: SearchEntry[], basePath: string[] = []) {
    const files = fs.readdirSync(dir)

    for (const file of files) {
        const filePath = path.join(dir, file)
        const stat = fs.statSync(filePath)

        if (stat.isDirectory()) {
            walk(filePath, entries, [...basePath, file])
        } else if (file.endsWith(".mdx") && file !== "index.mdx") {
            const raw = fs.readFileSync(filePath, "utf-8")
            const { data, content } = matter(raw)

            const slugParts = [...basePath, file.replace(".mdx", "")]
            const slug = `/docs/${slugParts.join("/")}`
            const section = getSectionTitle(dir)

            entries.push({
                title: (data.title as string) || file.replace(".mdx", ""),
                slug,
                section,
                content: extractText(content),
                headings: extractHeadings(content),
            })
        }
    }
}

for (const locale of ["en"]) {
    const contentDir = path.join(process.cwd(), "src", "content", locale)
    if (!fs.existsSync(contentDir)) continue

    const entries: SearchEntry[] = []
    walk(contentDir, entries)

    const outDir = path.join(process.cwd(), "public", "search-index")

    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true })
    }

    fs.writeFileSync(path.join(outDir, `${locale}.json`), JSON.stringify(entries, null, 2))
}
