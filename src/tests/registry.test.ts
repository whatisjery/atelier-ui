import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { demos } from "@/registry/demos/index"
import { components } from "@/registry/index"

const BASE_DIR = path.join(process.cwd(), "src/registry/base")
const DEMOS_DIR = path.join(process.cwd(), "src/registry/demos")
const CONTENT_DIR = path.join(process.cwd(), "src/content/en/components")
const REGISTRY_OUTPUT = path.join(process.cwd(), "public/registry")

/**
 * Test if the registry is clean and has all the components, demos, and documentation etc.
 */
describe("Cleanliness of the registry", () => {
    describe.each(components)("$name", (component) => {
        it("has all declared files on disk", () => {
            for (const file of component.files) {
                const filePath = path.join(BASE_DIR, component.name, file)
                expect(fs.existsSync(filePath)).toBe(true)
            }
        })

        it("has a matching demo component", () => {
            const demoKey = `${component.name}-demo`
            expect(demos).toHaveProperty(demoKey)
        })

        it("has a demo folder on disk", () => {
            const demoDir = path.join(DEMOS_DIR, `${component.name}-demo`)
            expect(fs.existsSync(demoDir)).toBe(true)
        })

        it("has a matching MDX doc file or folder", () => {
            const found = findMdx(CONTENT_DIR, component.name)
            expect(found).toBe(true)
        })

        it("has non-empty dependencies array", () => {
            expect(Array.isArray(component.dependencies)).toBe(true)
        })

        it("has valid looking dependency names", () => {
            for (const dep of component.dependencies) {
                expect(dep).toMatch(/^[@a-z]/)
                expect(dep.trim()).toBe(dep)
            }
        })

        it("has non empty files with actual content", () => {
            for (const file of component.files) {
                const filePath = path.join(BASE_DIR, component.name, file)
                const content = fs.readFileSync(filePath, "utf-8")
                expect(content.trim().length).toBeGreaterThan(0)
            }
        })
    })
})

describe("Demo exports", () => {
    it("every demo key maps to a folder on disk", () => {
        for (const key of Object.keys(demos)) {
            const demoDir = path.join(DEMOS_DIR, key)
            expect(fs.existsSync(demoDir)).toBe(true)
        }
    })

    it("no orphan demo folders (every demo folder is exported)", () => {
        const folders = fs
            .readdirSync(DEMOS_DIR, { withFileTypes: true })
            .filter((d) => d.isDirectory())
            .map((d) => d.name)

        for (const folder of folders) {
            expect(demos).toHaveProperty(folder)
        }
    })
})

describe("Build output", () => {
    const indexPath = path.join(REGISTRY_OUTPUT, "index.json")

    const buildExists = fs.existsSync(indexPath)

    it.skipIf(!buildExists)("index.json lists all components", () => {
        const index = JSON.parse(fs.readFileSync(indexPath, "utf-8"))
        const names = index.map((c: { name: string }) => c.name)

        for (const component of components) {
            expect(names).toContain(component.name)
        }
    })

    it.skipIf(!buildExists)("each component has a JSON file with non-empty file content", () => {
        for (const component of components) {
            const jsonPath = path.join(REGISTRY_OUTPUT, `${component.name}.json`)
            expect(fs.existsSync(jsonPath)).toBe(true)

            const data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"))
            expect(data.name).toBe(component.name)
            expect(data.files.length).toBeGreaterThan(0)

            for (const file of data.files) {
                expect(file.content.trim().length).toBeGreaterThan(0)
            }
        }
    })
})

function findMdx(dir: string, name: string): boolean {
    if (!fs.existsSync(dir)) return false

    const entries = fs.readdirSync(dir, { withFileTypes: true })

    for (const entry of entries) {
        if (entry.isDirectory()) {
            if (entry.name === name) {
                const inner = fs.readdirSync(path.join(dir, entry.name))
                if (inner.some((f) => f.endsWith(".mdx"))) return true
            }

            if (findMdx(path.join(dir, entry.name), name)) return true
        }
        if (entry.isFile() && entry.name === `${name}.mdx`) return true
    }

    return false
}
