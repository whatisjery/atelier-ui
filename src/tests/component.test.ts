import { describe, expect, it } from "vitest"
import { getComponentsList } from "@/lib/docs"

/**
 * Test if the componentsdocumentation is valid
 */
describe("Components", () => {
    it("Valid frontmatter", () => {
        const components = getComponentsList("en").flatMap((c) => c.children)

        components.forEach((c) => {
            expect(c.title).toBeTruthy()
            expect(c.type).toBe("file")
            expect(c.description).toBeTruthy()
        })
    })
})
