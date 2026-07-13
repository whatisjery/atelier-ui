import fs from "node:fs"
import path from "node:path"
import { appRoots } from "@/lib/app-roots"

export function overlayRoots(relPath: string): string[] {
    return appRoots.map((root) => path.join(root, relPath)).filter((dir) => fs.existsSync(dir))
}

/*
 * Later roots overlay earlier ones, so the last existing candidate wins.
 */
export function resolveOverlayPath(relPath: string): string | undefined {
    return overlayRoots(relPath).at(-1)
}
