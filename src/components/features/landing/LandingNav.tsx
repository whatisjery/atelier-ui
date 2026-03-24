import { ArrowUpRight, Menu, X } from "lucide-react"
import { motion } from "motion/react"
import { useState } from "react"
import { SiGithub } from "react-icons/si"
import BrandLink from "@/components/common/BrandLink"
import ThemeToggle from "@/components/common/ThemeToggle"
import Border from "@/components/ui/Border"
import Button from "@/components/ui/Button"
import { Link } from "@/i18n/navigation"
import { REPO_URL, VERSION } from "@/lib/constants"
import { expoInOut } from "@/lib/easing"
import { cn, formatComponentNumber } from "@/lib/utils"

const LINKS = [
    {
        label: "Components",
        href: "/docs/components",
        target: "_self",
    },
    {
        label: "Contribute",
        href: "/docs/getting-started/contribution",
        target: "_self",
    },
    {
        label: "Getting started",
        href: "/docs/getting-started",
        target: "_self",
    },
    {
        label: "Github",
        href: REPO_URL,
        target: "_blank",
    },
] as const

type Props = {
    activeComponentsCount: number
}

export default function LandingNav({ activeComponentsCount }: Props) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div
            className={cn(
                "fixed top-0 left-0 w-full h-18 bg-background/90 text-sm backdrop-blur-[10px] z-6",
                { "h-auto": isOpen, "h-18": !isOpen },
            )}
        >
            <Border direction="horizontal" className="bottom-0" />

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5, ease: expoInOut, delay: 0.5 }}
                className="min-h-18 max-w-landing-max-w mx-auto h-full md:px-10 px-6 grid md:grid-cols-[1fr_auto_1fr] grid-cols-[1fr_1fr] items-center"
            >
                <BrandLink
                    className="justify-self-start"
                    slot={<span className="text-mat-2/70 font-serif text-xl">({VERSION})</span>}
                />

                <nav className="max-md:hidden flex items-center space-x-5 font-regular">
                    {LINKS.map(({ label, href, target }) => (
                        <Link
                            target={target}
                            className="hover:text-mat-2 flex items-center"
                            key={label}
                            href={href}
                        >
                            {label}

                            {label === "Components" && (
                                <sup className="font-mono">
                                    {formatComponentNumber(activeComponentsCount)}
                                </sup>
                            )}
                            {target === "_blank" && (
                                <sup className="font-mono">
                                    <ArrowUpRight className="size-2.5 mt-0.5" />
                                </sup>
                            )}
                        </Link>
                    ))}
                </nav>

                <div className="max-md:hidden flex items-center justify-self-end">
                    <ThemeToggle key="theme" />

                    <Button key="github" variant="ghost" size="icon" asChild>
                        <Link target="_blank" rel="noopener noreferrer" href={REPO_URL}>
                            <SiGithub className="size-4" />
                        </Link>
                    </Button>
                </div>

                <div className="max-md:flex hidden items-center justify-self-end">
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
                        {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                    </Button>
                </div>
            </motion.div>

            {isOpen && (
                <div className="px-6 pb-8 border-t pt-5">
                    <nav className="flex flex-col text-base gap-y-1.5 font-medium">
                        {LINKS.map(({ label, href }) => (
                            <Link key={label} href={href}>
                                {label}
                                {label === "Components" && <sup className="font-mono">01</sup>}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center justify-end">
                        <ThemeToggle key="theme" />
                        <Button key="github" variant="ghost" size="icon" asChild>
                            <Link target="_blank" rel="noopener noreferrer" href={REPO_URL}>
                                <SiGithub className="size-4" />
                            </Link>
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
