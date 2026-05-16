import {
    type ReactNode,
    Suspense,
    useEffect,
    useId,
    useLayoutEffect,
    useSyncExternalStore,
} from "react"

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect

// Minimal teleport: <In> registers children in an external store,
// <Out> renders them — bridges across the Canvas React root the same
function WebglTeleport() {
    const items = new Map<string, ReactNode>()
    const listeners = new Set<() => void>()
    let snapshot: [string, ReactNode][] = []

    const emit = () => {
        snapshot = Array.from(items.entries())
        for (const listener of listeners) {
            listener()
        }
    }

    const subscribe = (l: () => void) => {
        listeners.add(l)
        return () => {
            listeners.delete(l)
        }
    }
    const getSnapshot = () => snapshot

    return {
        In({ children }: { children: ReactNode }) {
            const id = useId()

            useIsoLayoutEffect(() => {
                items.set(id, children)
                emit()
                return () => {
                    items.delete(id)
                    emit()
                }
            }, [id, children])
            return null
        },
        Out() {
            const list = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
            return (
                <>
                    {list.map(([id, node]) => (
                        <Suspense key={id} fallback={null}>
                            {node}
                        </Suspense>
                    ))}
                </>
            )
        },
    }
}

const webglTeleport = WebglTeleport()

export function WebglPortal() {
    return <webglTeleport.Out />
}

export { webglTeleport }
