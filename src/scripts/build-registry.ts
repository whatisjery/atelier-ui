import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { components } from "../registry"

const REGISTRY_DIR = path.join(process.cwd(), "src/registry")
const OUTPUT_DIR = path.join(process.cwd(), "public/registry")

async function buildRegistry() {
    await mkdir(OUTPUT_DIR, { recursive: true })

    const index = components.map((c) => ({
        name: c.name,
        description: c.description,
    }))

    await writeFile(path.join(OUTPUT_DIR, "index.json"), JSON.stringify(index, null, 2), "utf-8")

    for (const component of components) {
        const files = await Promise.all(
            component.files.map(async (filePath) => {
                const fullPath = path.join(REGISTRY_DIR, "base", component.name, filePath)
                const content = await readFile(fullPath, "utf-8")

                return {
                    path: filePath,
                    content,
                }
            }),
        )

        const sharedFiles = await Promise.all(
            component.shared.map(async (sharedPath) => {
                const fullPath = path.join(REGISTRY_DIR, `${sharedPath}`)
                const content = await readFile(fullPath, "utf-8")
                return { path: `${sharedPath}`, content }
            }),
        )

        const output = {
            name: component.name,
            description: component.description,
            dependencies: component.dependencies,
            shared: sharedFiles,
            files,
        }

        await writeFile(
            path.join(OUTPUT_DIR, `${component.name}.json`),
            JSON.stringify(output, null, 2),
            "utf-8",
        )
    }
}

buildRegistry().catch((error) => {
    console.error("😭😭😭 Registry build failed:", error)
    process.exit(1)
})
