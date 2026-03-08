import { type ClassValue, clsx } from "clsx"
import { icons, type LucideIcon } from "lucide-react"
import { twMerge } from "tailwind-merge"
import type { DocTree } from "@/types/docs"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function truncateText(text: string, maxLength: number = 30): string {
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text
}

export function formatPlaceholderTitle(item: DocTree): string {
    if (item.placeholder) {
        return "XXXXXXX"
    }
    return item.title
}

export function formatComponentNumber(number: number): string {
    return number.toString().padStart(2, "0")
}

export function getLucideIcon(name: string | undefined): LucideIcon {
    return icons[(name ?? "") as keyof typeof icons] ?? icons.Circle
}
