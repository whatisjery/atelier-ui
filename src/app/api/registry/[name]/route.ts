import { type NextRequest, NextResponse } from "next/server"
import { components } from "@/registry"

type GetRouteParams = {
    params: Promise<{ name: string }>
}

export async function GET(request: NextRequest, { params }: GetRouteParams) {
    const { name } = await params
    const component = components.find((c) => c.name === name)

    if (!component) {
        return NextResponse.json({ error: "Component not found" }, { status: 404 })
    }

    return NextResponse.redirect(new URL(`/registry/${name}.json`, request.url))
}
