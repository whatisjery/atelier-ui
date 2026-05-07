"use client"

import { BookOpen, ChevronDown, Folder, FolderOpen } from "lucide-react"
import { useTranslations } from "next-intl"
import React, { useState } from "react"
import Badge from "@/components/ui/Badge"
import ListItem from "@/components/ui/ListItem"
import { usePathname } from "@/i18n/navigation"
import { BRAND, VERSION } from "@/lib/constants"
import { useGlobalStore } from "@/lib/store"
import { cn, getLucideIcon, padStartFormat } from "@/lib/utils"
import type { DocTree } from "@/types/docs"

type SideBarContentProps = {
    className?: string
    sections: DocTree[]
    topBarSlot?: React.ReactNode
}

type NodeProps = {
    node: DocTree
    pathname: string
    hasCustomer: boolean
    closedKeys: string[]
    toggle: (key: string) => void
}

function getBadge(node: DocTree, hasCustomer: boolean) {
    if (node.pro && !hasCustomer) return <Badge title="pro" variant="neutral" />
    if (node.status === "new") return <Badge title="new" variant="neutral" />
    return null
}

function SectionNode({ node, pathname, hasCustomer, closedKeys, toggle }: NodeProps) {
    if (node.type === "file") {
        return (
            <ListItem
                sideLine={true}
                activeItem={pathname === node.url}
                leftSlot={getBadge(node, hasCustomer)}
                linkItem={{ href: node.url, label: node.title }}
            />
        )
    }

    const isOpen = !closedKeys.includes(node.url)
    const FolderIcon = isOpen ? FolderOpen : Folder

    return (
        <nav className={cn({ "mb-5": isOpen })}>
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
                        hasCustomer={hasCustomer}
                        closedKeys={closedKeys}
                        toggle={toggle}
                    />
                ))}
            </ul>
        </nav>
    )
}

export default function SideBarContent({ className, sections, topBarSlot }: SideBarContentProps) {
    const hasCustomer = useGlobalStore((state) => state.customer !== null)
    const pathname = usePathname()
    const [closedKeys, setClosedKeys] = useState<string[]>([])
    const tSidebar = useTranslations("docs.sidebar")

    const toggle = (key: string) => {
        setClosedKeys((prev) => {
            if (prev.includes(key)) return prev.filter((s) => s !== key)
            return [...prev, key]
        })
    }

    const flatSection = sections.find((s) => !s.children.some((c) => c.type === "folder"))
    const nestedSections = sections.filter((s) => s.children.some((c) => c.type === "folder"))

    return (
        <aside
            className={cn(
                "h-[calc(100vh-var(--spacing-nav-h))] border-r text-sm flex flex-col",
                className,
            )}
        >
            {topBarSlot}

            <div className="px-5 py-5 overflow-y-auto flex-1">
                <nav className="mb-7">
                    <ul>
                        <ListItem
                            sideLine={false}
                            activeItem={pathname === "/docs/components"}
                            linkItem={{
                                href: "/docs",
                                label: tSidebar("browse-catalog"),
                                icon: <BookOpen strokeWidth={1.5} className="size-5" />,
                            }}
                        />
                        {flatSection?.children.map(({ url, title, icon }) => {
                            const Icon = getLucideIcon(icon)
                            return (
                                <ListItem
                                    key={url}
                                    sideLine={false}
                                    activeItem={pathname === url}
                                    linkItem={{
                                        href: url,
                                        label: title,
                                        icon: <Icon strokeWidth={1.5} className="size-5" />,
                                    }}
                                />
                            )
                        })}
                    </ul>
                </nav>

                {nestedSections.map((section) => {
                    const subFolders = section.children.filter(({ type }) => type === "folder")
                    const childCount = subFolders.flatMap(({ children }) => children).length

                    return (
                        <React.Fragment key={section.url}>
                            <h2 className="font-medium mb-4 text-accent-1">
                                {section.title} ({padStartFormat(childCount)})
                            </h2>
                            {subFolders.map((folder) => (
                                <SectionNode
                                    key={folder.url}
                                    node={folder}
                                    pathname={pathname}
                                    hasCustomer={hasCustomer}
                                    closedKeys={closedKeys}
                                    toggle={toggle}
                                />
                            ))}
                        </React.Fragment>
                    )
                })}
            </div>

            <div className="w-full text-accent-2 font-mono border-t h-nav-h flex items-center justify-center text-xs">
                {BRAND} {VERSION} &copy;{new Date().getFullYear()}
            </div>
        </aside>
    )
}
