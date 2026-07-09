import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { proOverlay } from "@/lib/pro-overlay"
import { collages } from "@/registry/collage/index"
import { demos } from "@/registry/demos/index"
import { components } from "@/registry/index"

const BASE_DIR = path.join(process.cwd(), "src/registry/base")
const DEMOS_DIR = path.join(process.cwd(), "src/registry/demos")
const COLLAGE_DIR = path.join(process.cwd(), "src/registry/collage")
const PRO_CONTENT_DIR = path.join(process.cwd(), "src/pro/content")
const REGISTRY_OUTPUT = path.join(process.cwd(), "public/registry")

/**
 * Pro components live in the submodule tree, mirroring the public layout.
 */
function componentBaseDir(component: (typeof components)[number]): string {
    const publicDir = path.join(BASE_DIR, component.name)
    return component.pro ? proOverlay(publicDir) : publicDir
}

function demoDirCandidates(name: string): string[] {
    const publicDir = path.join(DEMOS_DIR, name)
    return [publicDir, proOverlay(publicDir)]
}

/**
 * Test if the registry is clean and has all the components, demos, and documentation etc.
 */
describe("Cleanliness of the registry", () => {
    it("has unique component names", () => {
        const names = components.map((component) => component.name)
        expect(new Set(names).size).toBe(names.length)
    })

    describe.each(components)("$name", (component) => {
        it("has all declared files on disk with actual content", () => {
            for (const file of component.files) {
                const filePath = path.join(componentBaseDir(component), file)
                const content = fs.readFileSync(filePath, "utf-8")
                expect(content.trim().length).toBeGreaterThan(0)
            }
        })

        it("has valid looking dependency names", () => {
            for (const dep of component.dependencies) {
                expect(dep).toMatch(/^[@a-z]/)
                expect(dep.trim()).toBe(dep)
            }
        })

        it("has all shared files on disk", () => {
            for (const sharedPath of component.shared) {
                const publicPath = path.join(process.cwd(), "src/registry", sharedPath)
                const exists = fs.existsSync(publicPath) || fs.existsSync(proOverlay(publicPath))
                expect(exists, `missing shared file "${sharedPath}"`).toBe(true)
            }
        })
    })
})

describe("Pro overlay structure", () => {
    const proComponents = components.filter((component) => component.pro)

    describe.each(proComponents)("$name", (component) => {
        it("keeps its base files in the pro submodule only", () => {
            expect(fs.existsSync(proOverlay(path.join(BASE_DIR, component.name)))).toBe(true)
            expect(fs.existsSync(path.join(BASE_DIR, component.name))).toBe(false)
        })

        it("keeps its demo in the pro submodule only", () => {
            expect(fs.existsSync(proOverlay(path.join(DEMOS_DIR, component.name)))).toBe(true)
            expect(fs.existsSync(path.join(DEMOS_DIR, component.name))).toBe(false)
        })

        it("has a doc page in the pro content tree", () => {
            const docs = fs
                .readdirSync(PRO_CONTENT_DIR, { recursive: true })
                .map(String)
                .filter((file) => path.basename(file) === `${component.name}.mdx`)
            expect(docs.length).toBeGreaterThan(0)
        })
    })
})

describe("Demo exports", () => {
    it("every demo key maps to a folder on disk", () => {
        for (const key of Object.keys(demos)) {
            const exists = demoDirCandidates(key).some((dir) => fs.existsSync(dir))
            expect(exists, `missing demo folder for "${key}"`).toBe(true)
        }
    })

    it("no orphan demo folders (every demo folder is exported)", () => {
        const folders = [DEMOS_DIR, proOverlay(DEMOS_DIR)]
            .filter((dir) => fs.existsSync(dir))
            .flatMap((dir) =>
                fs
                    .readdirSync(dir, { withFileTypes: true })
                    .filter((d) => d.isDirectory())
                    .map((d) => d.name),
            )

        for (const folder of folders) {
            expect(demos).toHaveProperty(folder)
        }
    })
})

describe("Collage exports", () => {
    it("every collage key maps to a folder on disk", () => {
        for (const key of Object.keys(collages)) {
            const collageDir = path.join(COLLAGE_DIR, key)
            expect(fs.existsSync(collageDir)).toBe(true)
        }
    })

    it("no orphan collage folders (every collage folder is exported)", () => {
        const folders = fs
            .readdirSync(COLLAGE_DIR, { withFileTypes: true })
            .filter((d) => d.isDirectory())
            .map((d) => d.name)

        for (const folder of folders) {
            expect(collages).toHaveProperty(folder)
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

    it.skipIf(!buildExists)("pro components are absent from the public build output", () => {
        for (const component of components.filter((component) => component.pro)) {
            const jsonPath = path.join(REGISTRY_OUTPUT, `${component.name}.json`)
            expect(fs.existsSync(jsonPath), `pro component "${component.name}" leaked`).toBe(false)
        }
    })

    it.skipIf(!buildExists)("each component has a JSON file with non-empty file content", () => {
        for (const component of components.filter((component) => !component.pro)) {
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
