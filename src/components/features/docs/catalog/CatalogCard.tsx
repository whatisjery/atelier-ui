"use client"

import Link from "next/link"
import { useRef } from "react"
import type { DocTree } from "@/types/docs"

type CatalogCardProps = {
    catalogItem: DocTree
}

export default function CatalogCard({ catalogItem }: CatalogCardProps) {
    const playRequest = useRef<Promise<void> | null>(null)
    const poster = catalogItem.preview?.replace(/\.[^.]+$/, ".webp")

    return (
        <Link href={catalogItem.url}>
            <div
                className="w-full border-none group transition-shadow duration-200 ease-expo-out cursor-pointer not-prose flex justify-between flex-col mb-10"
                key={catalogItem.title}
            >
                <div className="w-full flex relative flex-col h-full p-15">
                    <div className="pattern-line w-full h-full absolute inset-0 -z-1 border-t border-b border-r"></div>

                    <div className="relative w-full aspect-[720/460]">
                        <video
                            src={catalogItem.preview}
                            className="absolute inset-0 w-full h-full object-cover rounded-xl"
                            muted
                            loop
                            playsInline
                            preload="none"
                            aria-label={catalogItem.title}
                            onMouseEnter={(e) => {
                                playRequest.current = e.currentTarget.play()
                            }}
                            onMouseLeave={(e) => {
                                const video = e.currentTarget
                                playRequest.current?.then(() => {
                                    video.pause()
                                    video.currentTime = 0
                                })
                            }}
                        />
                        <img
                            src={poster}
                            alt={`${catalogItem.title} preview`}
                            width={720}
                            height={460}
                            className="absolute inset-0 w-full h-full object-cover rounded-xl opacity-100 transition-opacity duration-300 ease-expo-out pointer-events-none group-hover:opacity-0"
                        />
                    </div>
                </div>

                <div className="mt-4 ml-1">
                    <h3 className="text-xs text-accent-1 uppercase font-normal">
                        / {catalogItem.title}
                    </h3>

                    <p className="text-xs text-accent-3 uppercase font-medium">
                        {catalogItem.tags?.join(", ")}
                    </p>
                </div>
            </div>
        </Link>
    )
}
