"use client"

import { useProgress } from "@react-three/drei"
import { cn } from "@/lib/utils"

export default function Docr3fDemoLoader() {
    const progress = useProgress((s) => s.progress)

    return (
        <div
            className={cn(
                "absolute inset-0 flex items-center justify-center z-10 transition-opacity duration-500",
                {
                    "opacity-0 pointer-events-none": progress === 100,
                    "opacity-100": progress !== 100,
                },
            )}
        >
            <span className="font-mono text-accent-1">{Math.round(progress)}%</span>
        </div>
    )
}
