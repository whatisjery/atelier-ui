export type DocComponentStatus = "wip" | "new" | "update"

export type DocTree = {
    children: DocTree[]
    order: number
    title: string
    description: string
    url: string
    type: "file" | "folder"
    category?: string
    icon?: string
    tags?: string[]
    status?: DocComponentStatus
}

export type DocMeta = {
    category: string
    icon: string
    title: string
    description: string
    tags?: string[]
}

export type DocHeading = {
    id: string
    text: string
    level: number
}

export type DocNavigation = {
    prev: {
        title: string
        url: string
        description: string
    } | null
    next: {
        title: string
        url: string
        description: string
    } | null
}

export type QuickLink = {
    title: string
    href: string
    icon: string
    description: string
    tags: string[]
}
