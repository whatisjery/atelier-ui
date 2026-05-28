import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"
import { getDocStatus } from "@/components/features/docs/DocStatusBadge"
import { GIT_DAYS_THRESHOLD } from "@/lib/constants"

const MS_PER_DAY = 24 * 60 * 60 * 1000
const NOW = new Date("2026-05-28T00:00:00Z")
const RECENT = GIT_DAYS_THRESHOLD - 1
const OLD = GIT_DAYS_THRESHOLD * 3

function isoDaysAgo(days: number): string {
    return new Date(NOW.getTime() - days * MS_PER_DAY).toISOString()
}

describe("getDocStatus", () => {
    beforeAll(() => {
        vi.useFakeTimers()
        vi.setSystemTime(NOW)
    })

    afterAll(() => {
        vi.useRealTimers()
    })

    it('returns "new" when created within threshold', () => {
        expect(getDocStatus(isoDaysAgo(RECENT))).toBe("new")
    })

    it("returns null when creation is not within threshold", () => {
        expect(getDocStatus(isoDaysAgo(OLD))).toBeNull()
    })

    it("returns null when createdAt is missing", () => {
        expect(getDocStatus(undefined)).toBeNull()
    })

    it("returns null at exactly the threshold", () => {
        expect(getDocStatus(isoDaysAgo(GIT_DAYS_THRESHOLD))).toBeNull()
    })
})
