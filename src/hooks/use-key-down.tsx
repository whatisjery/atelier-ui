import { useEffect, useRef } from "react"

type KeyFilter = string | ((event: KeyboardEvent) => boolean)

type useKeyDownProps = {
    key: KeyFilter
    handler: (event: KeyboardEvent) => void
}

function isMatch(key: KeyFilter, event: KeyboardEvent) {
    if (typeof key === "function") return key(event)
    return event.key === key
}

export function useKeyDown({ key, handler }: useKeyDownProps) {
    const savedHandler = useRef(handler)
    savedHandler.current = handler

    useEffect(() => {
        function onKey(event: KeyboardEvent) {
            if (isMatch(key, event)) savedHandler.current(event)
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [key])
}
