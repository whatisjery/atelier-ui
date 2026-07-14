"use client"

import { BookOpen, ChevronDown, Folder, FolderOpen } from "lucide-react"
import { useTranslations } from "next-intl"
import React, { useState } from "react"
import Badge from "@/components/ui/Badge"
import ListItem from "@/components/ui/ListItem"
import { usePathname } from "@/i18n/navigation"
import { BRAND, VERSION } from "@/lib/constants"
import { cn, getLucideIcon, padStartFormat } from "@/lib/utils"
import type { DocTree } from "@/types/docs"
import DocStatusBadge from "../DocStatusBadge"

type RenderBadge = (node: DocTree) => React.ReactNode

export type SideBarTool = {
    href: string
    label: string
    icon?: React.ReactNode
    leftSlot?: React.ReactNode
}

type SideBarContentProps = {
    className?: string
    sections: DocTree[]
    topBarSlot?: React.ReactNode
    tools?: SideBarTool[]
    renderBadge?: RenderBadge
}

type NodeProps = {
    node: DocTree
    pathname: string
    renderBadge: RenderBadge
    closedKeys: string[]
    toggle: (key: string) => void
}

function matchesPath(pathname: string, href: string) {
    return pathname === href || pathname.startsWith(`${href}/`)
}

function findActiveHref(pathname: string, tools: SideBarTool[]) {
    return tools.reduce<string | null>((best, { href }) => {
        if (!matchesPath(pathname, href)) return best
        if (best !== null && href.length <= best.length) return best
        return href
    }, null)
}

function defaultBadge(node: DocTree) {
    if (node.tag) return <Badge title={node.tag} variant="neutral" />
    return <DocStatusBadge createdAt={node.createdAt} />
}

function SectionNode({ node, pathname, renderBadge, closedKeys, toggle }: NodeProps) {
    if (node.type === "file") {
        return (
            <ListItem
                sideLine={true}
                activeItem={pathname === node.url}
                leftSlot={renderBadge(node)}
                linkItem={{ href: node.url, label: node.title }}
            />
        )
    }

    const isOpen = !closedKeys.includes(node.url)
    const FolderIcon = isOpen ? FolderOpen : Folder

    return (
        <section className={cn({ "mb-3": isOpen })}>
            <button
                type="button"
                onClick={() => toggle(node.url)}
                aria-expanded={isOpen}
                className="flex items-center justify-between w-full cursor-pointer"
            >
                <span className="flex items-center gap-x-3 py-1 pb-1.5">
                    <FolderIcon strokeWidth={1.5} className="size-5" />
                    {node.category}
                </span>

                <ChevronDown
                    className={cn(
                        "size-5 transition-transform origin-center duration-100 ease-expo-out",
                        !isOpen && "-rotate-90",
                    )}
                />
            </button>

            <ul className={cn({ hidden: !isOpen })}>
                {node.children.map((child) => (
                    <SectionNode
                        key={child.url}
                        node={child}
                        pathname={pathname}
                        renderBadge={renderBadge}
                        closedKeys={closedKeys}
                        toggle={toggle}
                    />
                ))}
            </ul>
        </section>
    )
}

export default function SideBarContent({
    className,
    sections,
    topBarSlot,
    tools = [],
    renderBadge = defaultBadge,
}: SideBarContentProps) {
    const pathname = usePathname()
    const [closedKeys, setClosedKeys] = useState<string[]>([])
    const tSidebar = useTranslations("docs.sidebar")

    const allTools: SideBarTool[] = [
        {
            href: "/catalog",
            label: tSidebar("browse-catalog"),
            icon: <BookOpen strokeWidth={1.5} className="size-5" />,
        },
        ...tools,
    ]
    const activeHref = findActiveHref(pathname, allTools)

    const toggle = (key: string) => {
        setClosedKeys((prev) => {
            if (prev.includes(key)) return prev.filter((s) => s !== key)
            return [...prev, key]
        })
    }

    const orderedSections = [...sections]
        .filter((section) => (section.display ?? "flat") !== "folder")
        .sort((a, b) => a.order - b.order)

    return (
        <aside
            className={cn(
                "h-[calc(100vh-var(--spacing-nav-h))] border-r text-sm flex flex-col",
                className,
            )}
        >
            {topBarSlot}

            <nav className="px-5 py-5 overflow-y-auto flex-1 overscroll-none">
                {orderedSections.map((section) => {
                    const display = section.display ?? "flat"

                    if (display === "group") {
                        const subFolders = section.children.filter(({ type }) => type === "folder")
                        const childCount = subFolders.flatMap(({ children }) => children).length

                        return (
                            <React.Fragment key={section.url}>
                                <h2 className="font-medium mb-4 text-accent-1 mt-6">
                                    {section.title} ({padStartFormat(childCount)})
                                </h2>
                                {subFolders.map((folder) => (
                                    <SectionNode
                                        key={folder.url}
                                        node={folder}
                                        pathname={pathname}
                                        renderBadge={renderBadge}
                                        closedKeys={closedKeys}
                                        toggle={toggle}
                                    />
                                ))}
                            </React.Fragment>
                        )
                    }

                    return (
                        <React.Fragment key={section.url}>
                            <section className="mb-6">
                                <h2 className="sr-only">tools</h2>
                                <ul>
                                    {allTools.map(({ href, label, icon, leftSlot }) => (
                                        <ListItem
                                            key={href}
                                            sideLine={false}
                                            activeItem={href === activeHref}
                                            leftSlot={leftSlot}
                                            linkItem={{ href, label, icon }}
                                        />
                                    ))}
                                </ul>
                            </section>

                            <section>
                                <h2 className="font-medium mb-3 text-accent-1 mt-6">
                                    {tSidebar("documentation")}
                                </h2>

                                <ul>
                                    {section.children.map(({ url, title, icon }) => {
                                        const Icon = getLucideIcon(icon)
                                        return (
                                            <ListItem
                                                key={url}
                                                sideLine={false}
                                                activeItem={pathname === url}
                                                linkItem={{
                                                    href: url,
                                                    label: title,
                                                    icon: (
                                                        <Icon
                                                            strokeWidth={1.5}
                                                            className="size-5"
                                                        />
                                                    ),
                                                }}
                                            />
                                        )
                                    })}
                                </ul>
                            </section>
                        </React.Fragment>
                    )
                })}
            </nav>

            <div className="w-full text-accent-2 font-mono border-t h-nav-h flex items-center justify-center text-xs">
                {BRAND} {VERSION} &copy;{new Date().getFullYear()}
            </div>
        </aside>
    )
}
