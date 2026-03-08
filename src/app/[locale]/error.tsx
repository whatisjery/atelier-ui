"use client"

import { useEffect } from "react"

type ErrorProps = {
    error: Error
    reset: () => void
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="flex flex-col min-h-screen mt-offset-top gap-4 p-6 max-w-3xl mx-auto my-10">
            <div className="flex items-center gap-2 text-red-500">
                <span className="text-xl">●</span>
                <span className="font-mono font-semibold">{error.name}</span>
            </div>

            <p className="font-mono text-sm">{error.message}</p>

            {error.stack && (
                <pre className="bg-zinc-950 text-zinc-100 p-4 rounded-lg text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                    {error.stack}
                </pre>
            )}

            <button
                type="button"
                onClick={reset}
                className="self-start px-4 py-2 rounded-md bg-zinc-800 text-zinc-100 hover:bg-zinc-700 transition text-sm"
            >
                Retry
            </button>
        </div>
    )
}
