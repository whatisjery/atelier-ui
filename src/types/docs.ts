export type DocComponentStatus = "new" | "update"

export type DirMeta = {
    title?: string
    category?: string
    icon?: string
    order?: number
    nav?: boolean
}

export type DocMeta = {
    category: string
    icon: string
    title: string
    description: string
    tags?: string[]
}

export type DocTree = {
    children: DocTree[]
    order: number
    title: string
    description?: string
    url: string
    type: "file" | "folder"
    category?: string
    icon?: string
    tags?: string[]
    status?: DocComponentStatus
    pro?: boolean
    nav?: boolean
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
