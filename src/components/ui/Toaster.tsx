"use client"

import {
    CircleCheckIcon,
    InfoIcon,
    Loader2Icon,
    OctagonXIcon,
    TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

export default function Toaster({ ...props }: ToasterProps) {
    const { theme = "system" } = useTheme()

    return (
        <Sonner
            theme={theme as ToasterProps["theme"]}
            className="toaster group"
            richColors
            toastOptions={{ style: { boxShadow: "none" } }}
            offset={{ bottom: "2.5rem" }}
            mobileOffset={{ bottom: "1.5rem" }}
            icons={{
                success: <CircleCheckIcon className="size-4" />,
                info: <InfoIcon className="size-4" />,
                warning: <TriangleAlertIcon className="size-4" />,
                error: <OctagonXIcon className="size-4" />,
                loading: <Loader2Icon className="size-4 animate-spin" />,
            }}
            style={
                {
                    "--normal-bg": "var(--color-bg)",
                    "--normal-text": "var(--color-accent-1)",
                    "--normal-border": "var(--theme-border)",
                    "--border-radius": "0.8rem",

                    "--error-bg": "var(--danger-bg)",
                    "--error-text": "var(--danger-fg)",
                    "--error-border": "var(--danger-border)",
                    "--success-bg": "var(--color-bg)",
                    "--success-text": "var(--color-accent-1)",
                    "--success-border": "var(--theme-border)",
                    "--info-bg": "var(--color-bg)",
                    "--info-text": "var(--color-accent-1)",
                    "--info-border": "var(--theme-border)",
                    "--warning-bg": "var(--color-bg)",
                    "--warning-text": "var(--color-accent-1)",
                    "--warning-border": "var(--theme-border)",
                } as React.CSSProperties
            }
            {...props}
        />
    )
}
