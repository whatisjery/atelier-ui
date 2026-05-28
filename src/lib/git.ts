import timestamps from "./timestamps.json"

type GitFileDates = { createdAt: string | null; updatedAt: string | null }

export function getFileGitDates(filePath: string): GitFileDates {
    const key = filePath.replace(`${process.cwd()}/`, "")
    const entry = (timestamps as Record<string, GitFileDates>)[key]
    return {
        createdAt: entry?.createdAt ?? null,
        updatedAt: entry?.updatedAt ?? null,
    }
}
