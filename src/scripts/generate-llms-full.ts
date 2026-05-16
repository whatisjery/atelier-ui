import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"
import type { Root } from "mdast"
import { remark } from "remark"
import remarkGfm from "remark-gfm"
import remarkMdx from "remark-mdx"
import type { Node, Parent } from "unist"
import { visit } from "unist-util-visit"

const CONTENT_DIR = path.join(process.cwd(), "src/content/en")
const OUTPUT_FILE = path.join(process.cwd(), "public/llms-full.txt")

// Strip MDX JSX nodes (components like <DemoPreview />, <InstalGuideCLI />, etc.)
function stripMdxNodes(tree: Root) {
    visit(tree, (node: Node, index, parent: Parent | null) => {
        if (
            node.type === "mdxJsxFlowElement" ||
            node.type === "mdxJsxTextElement" ||
            node.type === "mdxjsEsm"
        ) {
            if (parent && typeof index === "number") {
                parent.children.splice(index, 1)
                return index
            }
        }
    })
}

function mdxToMarkdown(raw: string): string {
    const processor = remark().use(remarkMdx).use(remarkGfm)
    const tree = processor.parse(raw) as Root
    stripMdxNodes(tree)
    return remark().use(remarkGfm).stringify(tree)
}

function collectMdxFiles(dir: string): string[] {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    const files: string[] = []
    for (const entry of entries) {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) {
            files.push(...collectMdxFiles(full))
        } else if (entry.name.endsWith(".mdx")) {
            files.push(full)
        }
    }
    return files.sort()
}

function relativePath(file: string): string {
    return path.relative(CONTENT_DIR, file)
}

function buildOutput(): string {
    const files = collectMdxFiles(CONTENT_DIR)
    const sections: string[] = [
        "# Atelier UI — Full Documentation\n",
        "Source: https://atelier-ui.com/docs\n",
        `Generated: ${new Date().toISOString()}\n`,
        "---\n",
    ]

    for (const file of files) {
        const raw = fs.readFileSync(file, "utf-8")
        const { data: frontmatter, content } = matter(raw)
        const rel = relativePath(file)
        const title = frontmatter.title ?? rel
        const description = frontmatter.description ?? ""

        sections.push(`\n${"=".repeat(60)}`)
        sections.push(`## ${title}`)
        if (description) sections.push(`> ${description}\n`)
        sections.push(`Source file: ${rel}\n`)

        const markdown = mdxToMarkdown(content)
        sections.push(markdown)
    }

    return sections.join("\n")
}

const output = buildOutput()
fs.writeFileSync(OUTPUT_FILE, output, "utf-8")
console.log(`llms-full.txt written to ${OUTPUT_FILE}`)
