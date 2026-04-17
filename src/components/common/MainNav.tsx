"use client"

import { ArrowUpRight, Menu, Search } from "lucide-react"
import { useTranslations } from "next-intl"
import BrandLink from "@/components/common/BrandLink"
import GlobalSearch from "@/components/common/GlobalSearch"
import ThemeToggle from "@/components/common/ThemeToggle"
import AuthAccountDropdown from "@/components/features/auth/AuthAccountDropdown"
import AuthGuestDropdown from "@/components/features/auth/AuthGuestDropdown"
import Button from "@/components/ui/Button"
import Skeleton from "@/components/ui/Skeleton"
import { useIsMobile } from "@/hooks/use-mobile"
import { Link, usePathname } from "@/i18n/navigation"
import { REPO_URL, VERSION } from "@/lib/constants"
import { useGlobalStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import Border from "../ui/Border"

const LINKS = [
    {
        label: "Read the docs",
        href: "/docs",
        target: "_self",
    },
    {
        label: "Github",
        href: REPO_URL,
        target: "_blank",
    },
] as const

export default function MainNav() {
    const isMobile = useIsMobile(1024)
    const toggleSidebar = useGlobalStore((s) => s.toggleSidebar)
    const customer = useGlobalStore((s) => s.customer)
    const isCustomerPending = useGlobalStore((s) => s.isCustomerPending)
    const tCommon = useTranslations("common")
    const pathname = usePathname()
    const isLanding = pathname === "/"
    console.log(customer)
    return (
        <header className="w-full sticky top-0 z-20 left-0">
            <div className="bg-background/70 backdrop-blur-sm -z-1 w-screen fixed top-0 left-0 h-nav-h" />
            <Border direction="horizontal" className="bottom-0" />
            <div className="px-5 mx-auto flex items-center w-full justify-between h-nav-h">
                <nav className="text-sm flex items-center space-x-3 font-regular">
                    {!isLanding && (
                        <Button
                            className="xl:hidden block"
                            onClick={toggleSidebar}
                            size="icon"
                            variant="ghost-solid"
                        >
                            <Menu className="size-5" />
                        </Button>
                    )}

                    <BrandLink
                        slot={
                            <span className="text-mat-2/70 font-serif text-xl mr-3">
                                ({VERSION})
                            </span>
                        }
                    />

                    {!isMobile &&
                        LINKS.map(({ label, href, target }) => (
                            <Link
                                target={target}
                                className={cn("hover:text-mat-2 flex items-center", {
                                    "text-highlight font-medium": pathname.includes(href),
                                })}
                                key={label}
                                href={href}
                            >
                                {label}

                                {target === "_blank" && (
                                    <sup className="font-mono">
                                        <ArrowUpRight className="size-2.5 mt-0.5" />
                                    </sup>
                                )}
                            </Link>
                        ))}
                </nav>

                <div className="flex items-center gap-x-2">
                    <GlobalSearch
                        triggerSlot={({ onClick }) => (
                            <>
                                {!isMobile && (
                                    <Button
                                        type="button"
                                        aria-label={tCommon("search")}
                                        onClick={onClick}
                                        className="w-55 flex justify-between pr-1 pl-3"
                                    >
                                        <div className="flex items-center gap-x-2">
                                            <Search size={16} />
                                            <p className="font-regular">{tCommon("search")}</p>
                                        </div>

                                        <div className="flex text-mat-1 border items-center gap-x-1 bg-background px-2 rounded-lg">
                                            <kbd className="pointer-events-none flex items-center">
                                                <span className="text-[1.1rem]">⌘</span>
                                                <span className="text-[0.8rem]">K</span>
                                            </kbd>
                                        </div>
                                    </Button>
                                )}

                                {isMobile && (
                                    <Button onClick={onClick} size="icon" variant="ghost-solid">
                                        <Search className="size-5" />
                                    </Button>
                                )}
                            </>
                        )}
                    />
                    <ThemeToggle key="theme" />

                    {isCustomerPending && <Skeleton className="size-9 rounded-lg" />}

                    {!isCustomerPending && customer && <AuthAccountDropdown />}

                    {!isCustomerPending && !customer && <AuthGuestDropdown />}
                </div>
            </div>
        </header>
    )
}
