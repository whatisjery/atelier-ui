import { exec } from "node:child_process"
import http from "node:http"
import path from "node:path"
import { promisify } from "node:util"
import fs from "fs-extra"
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest"

const execAsync = promisify(exec)

const COMPONENTS_PATH = path.resolve(__dirname, "../test/fixtures/project/components")
const SHARED_PATH = path.resolve(__dirname, "../test/fixtures/project")
const REGISTRY_DIR = path.resolve(__dirname, "../../../public/registry")
const VALID_PRO_KEY = "test-pro-key-123"
const PRO_COMPONENTS = new Set(["halftone-glow"])

const PRO_FIXTURE = {
    name: "halftone-glow",
    description: "Half tone glow effect",
    dependencies: [],
    shared: [],
    files: [{ path: "halftone-glow.tsx", content: "export default function HalftoneGlow() {}" }],
}

let server: http.Server
let port: number

beforeAll(async () => {
    server = http.createServer((req, res) => {
        const componentName = (req.url || "").replace(/^\//, "").replace(/\.json$/, "")

        if (PRO_COMPONENTS.has(componentName)) {
            const authHeader = req.headers.authorization
            const key = authHeader?.replace("Bearer ", "")

            if (key !== VALID_PRO_KEY) {
                res.writeHead(401, { "Content-Type": "application/json" })
                res.end(JSON.stringify({ error: "License key required" }))
                return
            }

            res.writeHead(200, { "Content-Type": "application/json" })
            res.end(JSON.stringify(PRO_FIXTURE))
            return
        }

        const filePath = path.join(REGISTRY_DIR, `${req.url || ""}.json`)
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

describe("add command", () => {
    beforeEach(() => {
        fs.removeSync(COMPONENTS_PATH)
        fs.removeSync(path.join(SHARED_PATH, "hooks"))
        fs.removeSync(path.join(SHARED_PATH, "assets"))
    })

    it("installs a component", async () => {
        await execAsync(
            `npx tsx src/index.ts add fluid-distortion --path ${COMPONENTS_PATH} --no-install`,
            {
                cwd: path.resolve(__dirname, ".."),
                env: { ...process.env, ATELIER_REGISTRY: `http://localhost:${port}` },
            },
        )
        expect(fs.existsSync(`${COMPONENTS_PATH}/fluid-distortion/fluid-distortion.tsx`)).toBe(true)
    })

    it("installs a component with shared files", async () => {
        await execAsync(
            `npx tsx src/index.ts add pixel-trail --path ${COMPONENTS_PATH} --shared-path ${SHARED_PATH} --no-install`,
            {
                cwd: path.resolve(__dirname, ".."),
                env: { ...process.env, ATELIER_REGISTRY: `http://localhost:${port}` },
            },
        )
        expect(fs.existsSync(`${COMPONENTS_PATH}/pixel-trail/pixel-trail.tsx`)).toBe(true)
        expect(fs.existsSync(`${SHARED_PATH}/hooks/use-frame-loop.ts`)).toBe(true)
    })

    it("installs a component with shared assets", async () => {
        await execAsync(
            `npx tsx src/index.ts add liquid-touch --path ${COMPONENTS_PATH} --shared-path ${SHARED_PATH} --no-install`,
            {
                cwd: path.resolve(__dirname, ".."),
                env: { ...process.env, ATELIER_REGISTRY: `http://localhost:${port}` },
            },
        )
        expect(fs.existsSync(`${COMPONENTS_PATH}/liquid-touch/liquid-touch.tsx`)).toBe(true)
        expect(fs.existsSync(`${SHARED_PATH}/assets/ripple.png`)).toBe(true)
    })

    it("installs a pro component with a valid key", async () => {
        await execAsync(
            `npx tsx src/index.ts add halftone-glow --path ${COMPONENTS_PATH} --no-install`,
            {
                cwd: path.resolve(__dirname, ".."),
                env: {
                    ...process.env,
                    ATELIER_REGISTRY: `http://localhost:${port}`,
                    ATELIER_PRO_KEY: VALID_PRO_KEY,
                },
            },
        )
        expect(fs.existsSync(`${COMPONENTS_PATH}/halftone-glow/halftone-glow.tsx`)).toBe(true)
    })

    it("rejects a pro component without a key", async () => {
        await expect(
            execAsync(
                `npx tsx src/index.ts add halftone-glow --path ${COMPONENTS_PATH} --no-install`,
                {
                    cwd: path.resolve(__dirname, ".."),
                    env: {
                        ...process.env,
                        ATELIER_REGISTRY: `http://localhost:${port}`,
                        ATELIER_PRO_KEY: "",
                    },
                },
            ),
        ).rejects.toThrow()
    })

    it("rejects a pro component with an invalid key", async () => {
        await expect(
            execAsync(
                `npx tsx src/index.ts add halftone-glow --path ${COMPONENTS_PATH} --no-install`,
                {
                    cwd: path.resolve(__dirname, ".."),
                    env: {
                        ...process.env,
                        ATELIER_REGISTRY: `http://localhost:${port}`,
                        ATELIER_PRO_KEY: "wrong-key",
                    },
                },
            ),
        ).rejects.toThrow()
    })
})
