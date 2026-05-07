import fs from "node:fs"
import path from "node:path"
import { Polar } from "@polar-sh/sdk"
import { type NextRequest, NextResponse } from "next/server"
import { env } from "@/env"
import { components } from "@/registry"

const polar = new Polar({
    accessToken: env.POLAR_ACCESS_TOKEN,
    server: process.env.NODE_ENV === "production" ? "production" : "sandbox",
})

const REGISTRY_DIR = path.join(process.cwd(), "src/registry")

type GetRouteParams = {
    params: Promise<{ name: string }>
}

export async function GET(request: NextRequest, { params }: GetRouteParams) {
    const { name } = await params
    const component = components.find((c) => c.name === name)

    if (!component) {
        return NextResponse.json({ error: "Component not found" }, { status: 404 })
    }

    if (!component.pro) {
        return NextResponse.redirect(new URL(`/registry/${name}.json`, request.url))
    }

    const authHeader = request.headers.get("authorization")
    const key = authHeader?.replace("Bearer ", "")

    if (!key) {
        return NextResponse.json({ error: "License key required" }, { status: 401 })
    }

    try {
        const result = await polar.licenseKeys.validate({
            key,
            organizationId: env.POLAR_ORGANIZATION_ID,
        })
        if (result.status !== "granted") {
            return NextResponse.json({ error: "Invalid license key" }, { status: 401 })
        }
    } catch (error) {
        console.error("license validation error", error)
        return NextResponse.json({ error: "Invalid license key" }, { status: 401 })
    }

    const baseDir = path.join(REGISTRY_DIR, "base", name)

    const files = component.files.map((filePath) => ({
        path: filePath,
        content: fs.readFileSync(path.join(baseDir, filePath), "utf-8"),
    }))

    const shared = component.shared.map((sharedPath) => ({
        path: sharedPath,
        content: fs.readFileSync(path.join(REGISTRY_DIR, sharedPath), "utf-8"),
    }))

    return NextResponse.json({
        name: component.name,
        description: component.description,
        dependencies: component.dependencies,
        shared,
        files,
    })
}
