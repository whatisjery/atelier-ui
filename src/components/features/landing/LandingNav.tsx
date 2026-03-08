import { Menu, X } from "lucide-react"
import { animate, motion, useMotionValue } from "motion/react"
import Link from "next/link"
import { type ComponentRef, useLayoutEffect, useState } from "react"
import Logo from "@/components/common/Logo"
import Button from "@/components/ui/Button"
import { useRect } from "@/hooks/use-rect"
import { BRAND, REPO_URL } from "@/lib/constants"
import { expoOut } from "@/lib/easing"
import { formatComponentNumber } from "@/lib/utils"

const LINKS = [
    {
        label: "Components",
        href: "/docs/components",
        target: "_self",
    },
    {
        label: "Read docs",
        href: "/docs",
        target: "_self",
    },
    {
        label: "(Github)",
        href: REPO_URL,
        target: "_blank",
    },
] as const

type LandingNavProps = {
    activeComponentsCount: number
}

export default function LandingNav({ activeComponentsCount }: LandingNavProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [navRef, navRect] = useRect<ComponentRef<"nav">>()
    const left = useMotionValue(0)
    const width = useMotionValue(navRect.width)

    useLayoutEffect(() => {
        width.set(navRect.width)
    }, [navRect.width, width])

    const toggleMenu = () => {
        setIsOpen((prev) => !prev)
    }

    const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (!navRef.current) return
        const linkRect = e.currentTarget.getBoundingClientRect()
        const navRect = navRef.current.getBoundingClientRect()

        animate(left, linkRect.left - navRect.left, {
            duration: 0.4,
            ease: expoOut,
        })
        animate(width, linkRect.width, {
            duration: 0.4,
            ease: expoOut,
        })
        animate(
            ".bar",
            {
                filter: ["blur(0px)"],
                opacity: 1,
            },
            {
                duration: 0.4,
                ease: expoOut,
            },
        )
    }

    const handleMouseLeave = () => {
        animate(left, 0, {
            duration: 0.4,
            ease: expoOut,
        })
        animate(width, navRect.width, {
            duration: 0.4,
            ease: expoOut,
        })
        animate(
            ".bar",
            {
                filter: ["blur(5px)"],
                opacity: 0,
            },
            {
                duration: 0.9,
                ease: expoOut,
            },
        )
    }

    return (
        <motion.header
            initial={{ y: -20, opacity: 0, filter: "blur(10px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.7, ease: expoOut, delay: 1.3 }}
            className="w-[calc(100%-4rem)] xs:w-[calc(100%-10rem)] h-auto py-4 sm:!h-[4.6rem] overflow-hidden backdrop-blur-[10px] flex flex-col items-start bg-mat-5/90 dark:bg-mat-3/20 sm:w-[455px] fixed left-1/2 -translate-x-1/2 top-3 sm:top-4 z-6 rounded-2xl border"
        >
            <div className="flex items-center justify-between pl-4.5 pr-3 space-x-7 h-full w-full">
                <Link className="flex items-center gap-x-2" href="/">
                    <Logo size={20} />
                    <h1 className="font-serif text-xl">{BRAND}</h1>
                </Link>

                <div>
                    <nav
                        ref={navRef}
                        onMouseLeave={handleMouseLeave}
                        className="hidden sm:flex items-center rounded-lg py-3 relative"
                    >
                        <motion.span
                            aria-hidden="true"
                            style={{ left, width }}
                            className="max-sm:hidden bar blur-sm opacity-0 absolute h-full top-0 bg-mat-4 dark:bg-mat-3/20 rounded-xl pointer-events-none"
                        />

                        {LINKS.map(({ label, href, target }) => (
                            <Link
                                className="relative group top-[0.3px] px-2.5 hover:"
                                target={target}
                                key={label}
                                href={href}
                                onMouseEnter={handleMouseEnter}
                            >
                                {label}
                                {label === "Components" && (
                                    <sup className="font-mono">
                                        {formatComponentNumber(activeComponentsCount)}
                                    </sup>
                                )}
                            </Link>
                        ))}
                    </nav>

                    <Button onClick={toggleMenu} size="icon" variant="ghost" className="sm:hidden">
                        {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                    </Button>
                </div>
            </div>

            {isOpen && (
                <nav className="flex flex-col font-medium text-base gap-y-1.5 px-6 py-5 pt-7">
                    {LINKS.map(({ label, href }) => (
                        <Link key={label} href={href}>
                            {label}
                            {label === "Components" && <sup className="font-mono">01</sup>}
                        </Link>
                    ))}
                </nav>
            )}
        </motion.header>
    )
}
