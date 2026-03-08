import { exec } from "node:child_process"
import http from "node:http"
import path from "node:path"
import { promisify } from "node:util"
import fs from "fs-extra"
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest"

const execAsync = promisify(exec)

const COMPONENTS_PATH = path.resolve(__dirname, "../test/fixtures/project/components")
const REGISTRY_DIR = path.resolve(__dirname, "../../../public/registry")

let server: http.Server
let port: number

beforeAll(async () => {
    server = http.createServer((req, res) => {
        const filePath = path.join(REGISTRY_DIR, req.url || "")
        if (fs.existsSync(filePath)) {
            res.writeHead(200, { "Content-Type": "application/json" })
            res.end(fs.readFileSync(filePath))
        } else {
            res.writeHead(404)
            res.end()
        }
    })

    await new Promise<void>((resolve) => {
        server.listen(0, () => {
            port = (server.address() as { port: number }).port
            resolve()
        })
    })
})

afterAll(() => {
    server.close()
})

describe("add command to project", () => {
    beforeEach(() => {
        fs.removeSync(COMPONENTS_PATH)
    })

    it("installs a component to a project", async () => {
        await execAsync(
            `npx tsx src/index.ts add fluid-cursor --path ${COMPONENTS_PATH} --no-install`,
            {
                cwd: path.resolve(__dirname, ".."),
                env: { ...process.env, ATELIER_REGISTRY: `http://localhost:${port}` },
            },
        )
        expect(fs.existsSync(`${COMPONENTS_PATH}/fluid-cursor/fluid-cursor.tsx`)).toBe(true)
    })
})
