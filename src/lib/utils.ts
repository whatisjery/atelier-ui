import { type ClassValue, clsx } from "clsx"
import { icons, type LucideIcon } from "lucide-react"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function truncateText(text: string, maxLength: number = 30): string {
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text
}

export function formatComponentNumber(number: number): string {
    return number.toString().padStart(2, "0")
}

export function getLucideIcon(name: string | undefined): LucideIcon {
    return icons[(name ?? "") as keyof typeof icons] ?? icons.Circle
}

export function toKebabCase(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()
}

export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message
    return String(error)
}
