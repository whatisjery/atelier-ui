import fs from "node:fs"
import path from "node:path"

const PUBLIC_SRC = path.join(process.cwd(), "src")
const PRO_SRC = path.join(process.cwd(), "src/pro")

export function proOverlay(absPath: string): string {
    return path.join(PRO_SRC, path.relative(PUBLIC_SRC, absPath))
}

export function overlayRoots(absDir: string): string[] {
    return [absDir, proOverlay(absDir)].filter((dir) => fs.existsSync(dir))
}
