import fs from "node:fs"
import path from "node:path"
import { components } from "@/registry"
import type { CodeFile } from "@/types/code"
import { getCodesBlock } from "./docs"

const TEXT_EXTENSIONS = ["ts", "tsx", "js", "jsx", "css", "json"]
const REGISTRY_DIR = path.join(process.cwd(), "src/registry")

export function getComponentSnippets(): Record<string, CodeFile[]> {
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
        snippets[component.name] = [...baseCode[component.name], ...shared]
    }

    return snippets
}
