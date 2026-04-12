import { cp, readdir, readFile, rm, stat, writeFile } from "node:fs/promises"
import path from "node:path"

const PRO_SRC = path.join(process.cwd(), "src/pro/src")
const ROOT_SRC = path.join(process.cwd(), "src")
const GITIGNORE_PATH = path.join(process.cwd(), ".gitignore")

const START_MARKER = "# PRO-MERGE (auto-generated, do not edit)"
const END_MARKER = "# END PRO-MERGE"

const MERGE_RULES = [
    { from: "content", to: "content" },
    { from: "registry/base", to: "registry/base" },
    { from: "registry/demos", to: "registry/demos" },
] as const

async function exists(p: string) {
    try {
        await stat(p)
        return true
    } catch {
        return false
    }
}

async function getPreviousPaths(): Promise<string[]> {
    if (!(await exists(GITIGNORE_PATH))) return []
    const content = await readFile(GITIGNORE_PATH, "utf-8")
    const start = content.indexOf(START_MARKER)
    const end = content.indexOf(END_MARKER)
    if (start === -1 || end === -1) return []
    return content
        .slice(start + START_MARKER.length, end)
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
}

async function cleanPreviousMerge() {
    const paths = await getPreviousPaths()
    for (const p of paths) {
        const fullPath = path.join(process.cwd(), p)
        if (await exists(fullPath)) {
            await rm(fullPath, { force: true })
        }
    }
}

async function collectLeafPaths(srcDir: string, destBase: string, result: string[]) {
    const entries = await readdir(srcDir, { withFileTypes: true })
    for (const entry of entries) {
        const srcPath = path.join(srcDir, entry.name)
        const destPath = path.join(destBase, entry.name)
        if (entry.isDirectory()) {
            await collectLeafPaths(srcPath, destPath, result)
        } else {
            result.push(path.relative(process.cwd(), destPath))
        }
    }
}

async function updateGitignore(copiedPaths: string[]) {
    let content = ""

    if (await exists(GITIGNORE_PATH)) {
        content = await readFile(GITIGNORE_PATH, "utf-8")
    }

    const start = content.indexOf(START_MARKER)
    const end = content.indexOf(END_MARKER)

    if (start !== -1 && end !== -1) {
        content = content.slice(0, start) + content.slice(end + END_MARKER.length + 1)
    }

    const block = `${START_MARKER}\n${copiedPaths.join("\n")}\n${END_MARKER}\n`
    content = `${content.trimEnd()}\n\n${block}`

    await writeFile(GITIGNORE_PATH, content, "utf-8")
}

async function mergePro() {
    if (!(await exists(PRO_SRC))) return

    console.log("[merge-pro] Cleaning previous merge...")
    await cleanPreviousMerge()

    console.log("[merge-pro] Copying pro files...")
    const copiedPaths: string[] = []

    for (const rule of MERGE_RULES) {
        const srcDir = path.join(PRO_SRC, rule.from)
        if (!(await exists(srcDir))) continue

        const destDir = path.join(ROOT_SRC, rule.to)
        await cp(srcDir, destDir, { recursive: true, force: true })
        await collectLeafPaths(srcDir, destDir, copiedPaths)
        console.log(`  copied ${rule.from}/`)
    }

    await updateGitignore(copiedPaths)
    console.log(`[merge-pro] Done. ${copiedPaths.length} files merged.`)
}

mergePro().catch((error) => {
    console.error("merge-pro failed:", error)
    process.exit(1)
})
