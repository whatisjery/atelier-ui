import { spawnSync } from "node:child_process"
import path from "node:path"
import { Command } from "commander"
import fs from "fs-extra"
import { getPackageManager } from "./utils"

const REGISTRY_URL = process.env.ATELIER_REGISTRY || "https://atelier-ui.com/registry"

export const addCommand = new Command()
    .command("add <component>")
    .description("Add a component to the project")
    .option("-p, --path <path>", "destination path", "src/components")
    .option("-f, --force", "overwrite existing files", false)
    .option("-r, --registry <url>", "registry URL", REGISTRY_URL)
    .option("--no-install", "skip dependency installation")
    .action(async (component, options) => {
        let res: Response

        const url = `${options.registry}/${component}.json`

        try {
            res = await fetch(url)
        } catch (err) {
            console.error("Network error:", (err as Error).message)
            process.exit(1)
        }
        if (!res.ok) {
            console.error(`Component "${component}" not found`)
            process.exit(1)
        }

        const data = await res.json()

        if (!data.files || !Array.isArray(data.files)) {
            console.error("Invalid component data")
            process.exit(1)
        }

        for (const file of data.files) {
            if (file.path.includes("..")) {
                console.error(`Invalid file path: ${file.path}`)
                process.exit(1)
            }

            const destPath = path.join(options.path, component, file.path)

            if ((await fs.pathExists(destPath)) && !options.force) {
                console.error(`File already exists: ${destPath}`)
                console.error("Use --force to overwrite")
                process.exit(1)
            }

            await fs.ensureDir(path.dirname(destPath))
            await fs.writeFile(destPath, file.content)
        }

        console.log(`Added ${component}`)

        if (options.install && data.dependencies?.length) {
            const validDep = /^(@?[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*(@[^\s]+)?$/i

            for (const dep of data.dependencies) {
                if (!validDep.test(dep)) {
                    console.error(`Invalid dependency: ${dep}`)
                    process.exit(1)
                }
            }

            const pm = getPackageManager()
            const result = spawnSync(pm, ["install", ...data.dependencies], { stdio: "inherit" })

            if (result.status !== 0) {
                console.error("Failed to install dependencies")
                process.exit(1)
            }
        }
    })
