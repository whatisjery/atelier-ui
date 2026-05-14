import { useThree } from "@react-three/fiber"
import {
    Fragment,
    type ReactNode,
    Suspense,
    useEffect,
    useId,
    useLayoutEffect,
    useMemo,
    useRef,
    useSyncExternalStore,
} from "react"
import type { PerspectiveCamera as PerspectiveCameraImpl } from "three"

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
                        <Fragment key={id}>{node}</Fragment>
                    ))}
                </>
            )
        },
    }
}

// Perspective camera positioned so 1 unit = 1 pixel at z = 0.
// 2D images at z = 0 render pixel-perfect against the DOM
function ScreenSpaceCamera({ fov = 50 }: { fov?: number }) {
    const cameraRef = useRef<PerspectiveCameraImpl>(null)
    const size = useThree((s) => s.size)
    const set = useThree((s) => s.set)
    const get = useThree((s) => s.get)

    const { distance, aspect } = useMemo(() => {
        const ratio = Math.tan(((fov / 2) * Math.PI) / 180) * 2

        return {
            distance: size.height / ratio,
            aspect: size.width / size.height,
        }
    }, [fov, size.width, size.height])

    useLayoutEffect(() => {
        const cam = cameraRef.current
        if (!cam) return
        cam.lookAt(0, 0, 0)
        cam.updateProjectionMatrix()
        cam.updateMatrixWorld()
    }, [distance, aspect])

    useLayoutEffect(() => {
        const cam = cameraRef.current
        if (!cam) return
        const previous = get().camera
        set(() => ({ camera: cam }))
        return () => set(() => ({ camera: previous }))
    }, [set, get])

    return (
        <perspectiveCamera
            ref={cameraRef}
            position={[0, 0, distance]}
            fov={fov}
            aspect={aspect}
            near={0.1}
            far={distance * 2}
        />
    )
}

const webglTeleport = WebglTeleport()

export function AtelierRig() {
    return (
        <>
            <ScreenSpaceCamera />
            <Suspense fallback={null}>
                <webglTeleport.Out />
            </Suspense>
        </>
    )
}

export { webglTeleport }
