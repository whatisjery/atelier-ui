import { execSync } from "node:child_process"
import fs from "node:fs"
import { glob } from "fast-glob"

const files = glob.sync("src/content/**/*.mdx")
const timestamps: Record<string, { createdAt: string | null; updatedAt: string | null }> = {}

for (const file of files) {
    try {
        const created = execSync(`git log --diff-filter=A --format=%aI -- "${file}"`, {
            encoding: "utf-8",
        }).trim()
        const modified = execSync(`git log -1 --format=%aI -- "${file}"`, {
            encoding: "utf-8",
        }).trim()
        timestamps[file] = { createdAt: created || null, updatedAt: modified || null }
    } catch {
        timestamps[file] = { createdAt: null, updatedAt: null }
    }
}

fs.writeFileSync("src/lib/timestamps.json", JSON.stringify(timestamps, null, 2))
