export type SectionDisplay = "flat" | "group" | "folder"

export type DirMeta = {
    title?: string
    category?: string
    icon?: string
    order?: number
    nav?: boolean
    navOrder?: number
    display?: SectionDisplay
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
    createdAt?: string
    updatedAt?: string
    tag?: string
    hidden?: boolean
    nav?: boolean
    navOrder?: number
    display?: SectionDisplay
    preview?: string
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
