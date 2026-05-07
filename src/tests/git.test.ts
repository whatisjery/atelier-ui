import { describe, expect, it, vi } from "vitest"
import { getComponentStatus } from "@/lib/docs"
import * as git from "@/lib/git"

vi.spyOn(git, "getFileGitDates")

const MS_PER_DAY = 24 * 60 * 60 * 1000

function daysAgo(days: number): Date {
    return new Date(Date.now() - days * MS_PER_DAY)
}

function mockDates(createdAt: Date | null, updatedAt: Date | null) {
    vi.mocked(git.getFileGitDates).mockReturnValue({ createdAt, updatedAt })
}

/**
 * Test if the getComponentStatus function works as expected (new, update, wip)
 */
describe("Component status", () => {
    it('returns "new" when created recently', () => {
        const date = daysAgo(5)
        mockDates(date, date)
        expect(getComponentStatus("file.ts")).toBe("new")
    })

    it('returns "new" even if edited while still recent', () => {
        mockDates(daysAgo(10), daysAgo(1))
        expect(getComponentStatus("file.ts")).toBe("new")
    })

    it('returns "update" when old file was recently modified', () => {
        mockDates(daysAgo(60), daysAgo(3))
        expect(getComponentStatus("file.ts")).toBe("update")
    })

    it("returns undefined when old and not recently modified", () => {
        mockDates(daysAgo(60), daysAgo(45))
        expect(getComponentStatus("file.ts")).toBeUndefined()
    })

    it("returns undefined when createdAt is null", () => {
        mockDates(null, null)
        expect(getComponentStatus("file.ts")).toBeUndefined()
    })

    it("returns undefined when old file was never edited", () => {
        const date = daysAgo(30)
        mockDates(date, date)
        expect(getComponentStatus("file.ts")).toBeUndefined()
    })

    it('returns "new" at 19 days', () => {
        const date = daysAgo(19)
        mockDates(date, date)
        expect(getComponentStatus("file.ts")).toBe("new")
    })

    it("returns undefined at exactly 20 days", () => {
        const date = daysAgo(20)
        mockDates(date, date)
        expect(getComponentStatus("file.ts")).toBeUndefined()
    })

    it("returns undefined when updatedAt is null on old file", () => {
        mockDates(daysAgo(60), null)
        expect(getComponentStatus("file.ts")).toBeUndefined()
    })
})
