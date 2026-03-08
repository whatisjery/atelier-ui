import { existsSync } from "node:fs"

export function getPackageManager(): string {
    if (existsSync("pnpm-lock.yaml")) return "pnpm"
    if (existsSync("yarn.lock")) return "yarn"
    if (existsSync("bun.lockb") || existsSync("bun.lock")) return "bun"
    return "npm"
}
