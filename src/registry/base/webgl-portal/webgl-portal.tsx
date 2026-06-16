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

    const subscribe = (listener: () => void) => {
        listeners.add(listener)
        return () => {
            listeners.delete(listener)
        }
    }
    const getSnapshot = () => snapshot

    function useItems() {
        return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
    }

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
        useItems,
        Out() {
            const list = useItems()
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
const effectTeleport = WebglTeleport()

export function WebglPortal() {
    return <webglTeleport.Out />
}

export { effectTeleport, webglTeleport }
