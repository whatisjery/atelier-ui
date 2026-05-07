import timestamps from "./timestamps.json"

type GitFileDates = { createdAt: Date | null; updatedAt: Date | null }


export function getFileGitDates(filePath: string): GitFileDates {
    const key = filePath.replace(`${process.cwd()}/`, "")
    const entry = (
        timestamps as Record<string, { createdAt: string | null; updatedAt: string | null }>
    )[key]
    return {
        createdAt: entry?.createdAt ? new Date(entry.createdAt) : null,
        updatedAt: entry?.updatedAt ? new Date(entry.updatedAt) : null,
    }
}
