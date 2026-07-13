import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { resolveTransitiveDependencies } from "@/lib/resolve-dependencies"
import { resolveOverlayPath } from "@/lib/roots"
import { demos } from "@/registry/demos/index"
import { components } from "@/registry/index"

const BASE_DIR = "src/registry/base"
const DEMOS_DIR = "src/registry/demos"
const REGISTRY_OUTPUT = path.join(process.cwd(), "public/registry")

function componentBaseDir(component: (typeof components)[number]): string {
    const dir = resolveOverlayPath(path.join(BASE_DIR, component.name))
    if (!dir) throw new Error(`missing base folder for "${component.name}"`)
    return dir
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
                const resolved = resolveOverlayPath(path.join("src/registry", sharedPath))
                expect(resolved, `missing shared file "${sharedPath}"`).toBeDefined()
            }
        })
    })
})

/**
 * The CLI writes the resolved component's files, its shared files, and the
 * files of its resolved registry dependencies, then installs its resolved
 * npm dependencies. Every import in that install must be covered.
 */
describe("Resolved installs are self-contained", () => {
    const IGNORED_PACKAGES = new Set(["react", "react-dom"])

    function packageName(specifier: string): string {
        const parts = specifier.split("/")
        return specifier.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0]
    }

    function importsOf(component: (typeof components)[number]): string[] {
        const files = component.files.map((file) => path.join(componentBaseDir(component), file))
        const sources = files.map((file) => fs.readFileSync(file, "utf-8"))
        return sources.flatMap((source) =>
            [...source.matchAll(/from\s+"([^"]+)"/g)].map((match) => match[1]),
        )
    }

    function componentByName(name: string) {
        const entry = components.find((c) => c.name === name)
        if (!entry) throw new Error(`unknown component "${name}"`)
        return entry
    }

    describe.each(components)("$name", (component) => {
        it("installs every npm package its files import", () => {
            const resolved = resolveTransitiveDependencies(component.name)
            const tree = [component.name, ...resolved.registryDependencies].map(componentByName)

            for (const entry of tree) {
                const packages = importsOf(entry)
                    .filter((s) => !s.startsWith(".") && !s.startsWith("@/"))
                    .map(packageName)
                    .filter((pkg) => !IGNORED_PACKAGES.has(pkg))

                for (const pkg of packages) {
                    expect(
                        resolved.dependencies,
                        `"${component.name}" installs "${entry.name}" which imports "${pkg}"`,
                    ).toContain(pkg)
                }
            }
        })

        it("ships every registry file its files import", () => {
            const resolved = resolveTransitiveDependencies(component.name)
            const shipped = new Set([component.name, ...resolved.registryDependencies])

            for (const entry of [...shipped].map(componentByName)) {
                const siblings = importsOf(entry).flatMap((specifier) => {
                    const match = specifier.match(/^\.\.\/([^./][^/]*)\//)
                    return match ? [match[1]] : []
                })

                for (const sibling of siblings) {
                    expect(
                        shipped,
                        `"${component.name}" installs "${entry.name}" which imports sibling "${sibling}"`,
                    ).toContain(sibling)
                }
            }
        })
    })
})

describe("Demo exports", () => {
    it("every demo key maps to a folder on disk", () => {
        for (const key of Object.keys(demos)) {
            const dir = resolveOverlayPath(path.join(DEMOS_DIR, key))
            expect(dir, `missing demo folder for "${key}"`).toBeDefined()
        }
    })

    it("no orphan demo folders (every demo folder is exported)", () => {
        const folders = fs
            .readdirSync(path.join(process.cwd(), DEMOS_DIR), { withFileTypes: true })
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
