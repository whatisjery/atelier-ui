export const BRAND = "Atelier UI" as const
export const VERSION = "0.1.0" as const
export const PACKAGE_NAME = "atelier-ui" as const
export const REPO_URL = "https://github.com/whatisjery/project-lib" as const
export const GIT_DAYS_THRESHOLD = 20
export const LANDING_REVEAL_DELAY = 1.3

export const TEMP_NAV_LINKS = [
    {
        key: "overview",
        href: "/docs",
        wip: false,
    },
    {
        key: "builder",
        href: "#",
        wip: true,
    },
    {
        key: "changelogs",
        href: "#",
        wip: true,
    },
] as const

export const SOCIAL_LINKS = [
    {
        label: "Github",
        href: REPO_URL,
        disabled: false,
    },
    {
        label: "Discord",
        href: "#",
        disabled: true,
    },
    {
        label: "X",
        href: "#",
        disabled: true,
    },
] as const

export const FOOTER_LINKS = [
    {
        key: "docs",
        href: "/docs",
    },
    {
        key: "getting-started",
        href: "/docs/getting-started",
    },
    {
        key: "components",
        href: "/docs/components",
    },
    {
        key: "contribute",
        href: "/docs/getting-started/contribution",
    },
] as const
