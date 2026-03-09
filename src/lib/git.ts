import { execSync } from "node:child_process"
import path from "node:path"

type GitFileDates = {
    createdAt: Date | null
    updatedAt: Date | null
}

/**
 * Get the git dates for a file, when last created and updated etc.
 * (used for components badges: new, update, wip)
 */
export function getFileGitDates(filePath: string): GitFileDates {
    try {
        const relativePath = path.relative(process.cwd(), filePath)

        const created = execSync(`git log --diff-filter=A --format=%aI -- "${relativePath}"`, {
            encoding: "utf-8",
        }).trim()

        const modified = execSync(`git log -1 --format=%aI -- "${relativePath}"`, {
            encoding: "utf-8",
        }).trim()

        console.log("filePath:", filePath)
        console.log("relativePath:", path.relative(process.cwd(), filePath))
        console.log("result:", created, modified)

        return {
            createdAt: created ? new Date(created) : null,
            updatedAt: modified ? new Date(modified) : null,
        }
    } catch {
        return { createdAt: null, updatedAt: null }
    }
}
