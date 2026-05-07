import { spawnSync } from "node:child_process"
import path from "node:path"
import { Command } from "commander"
import fs from "fs-extra"
import { getPackageManager } from "./utils"

const REGISTRY_URL = process.env.ATELIER_REGISTRY || "https://www.atelier-ui.com/api/registry"

export const addCommand = new Command()
    .command("add <component>")
    .description("Add a component to the project")
    .option("-p, --path <path>", "destination path", "src/components")
    .option("-f, --force", "overwrite existing files", false)
    .option("-r, --registry <url>", "registry URL", REGISTRY_URL)
    .option("--no-install", "skip dependency installation")
    .option("--shared-path <path>", "shared file destination", "src")
    .action(async (component, options) => {
        let res: Response

        const url = `${options.registry}/${component}`
        const headers: Record<string, string> = {}
        const proKey = process.env.ATELIER_PRO_KEY

        if (proKey) {
            headers.Authorization = `Bearer ${proKey}`
        }

        try {
            res = await fetch(url, { headers })
        } catch (err) {
            console.error("Network error:", (err as Error).message)
            process.exit(1)
        }

        if (!res.ok) {
            if (res.status === 401) {
                console.error(`"${component}" is a pro component. Add ATELIER_PRO_KEY to your .env`)
                process.exit(1)
            }
            console.error(`Component "${component}" not found`)
            process.exit(1)
        }

        const data = await res.json()

        if (!data.files || !Array.isArray(data.files)) {
            console.error("Invalid component data")
            process.exit(1)
        }

        if (Array.isArray(data.registryDependencies)) {
            for (const dep of data.registryDependencies) {
                const depRes = await fetch(`${options.registry}/${dep}`, { headers })

                if (!depRes.ok) {
                    console.error(`Dependency "${dep}" not found`)
                    process.exit(1)
                }

                const depData = await depRes.json()

                for (const file of depData.files) {
                    const destPath = path.join(options.path, dep, file.path)

                    if (await fs.pathExists(destPath)) continue

                    await fs.ensureDir(path.dirname(destPath))
                    await fs.writeFile(destPath, file.content)
                }
                console.log(`Added registry dependency: ${dep}`)
            }
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

        if (data.shared && Array.isArray(data.shared)) {
            for (const file of data.shared) {
                if (file.path.includes("..")) {
                    console.error(`Invalid shared file path: ${file.path}`)
                    process.exit(1)
                }

                const destPath = path.join(options.sharedPath, file.path)

                if (await fs.pathExists(destPath)) {
                    console.log(`Shared file already exists: ${file.path} (skipped)`)
                    continue
                }

                await fs.ensureDir(path.dirname(destPath))
                await fs.writeFile(destPath, file.content)
                console.log(`Added shared file: ${file.path}`)
            }
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
