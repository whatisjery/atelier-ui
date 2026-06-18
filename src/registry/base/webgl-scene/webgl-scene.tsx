import { shaderMaterial, useFBO } from "@react-three/drei"
import { createPortal, extend, type ThreeElement, useFrame, useThree } from "@react-three/fiber"
import { type ReactNode, type RefObject, useLayoutEffect, useMemo, useRef } from "react"
import { type Mesh, PerspectiveCamera, Scene, Texture } from "three"
import { webglTeleport } from "../webgl-portal/webgl-portal"

const DisplayMaterial = shaderMaterial(
    { uMap: new Texture() },
    /* glsl */ `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    /* glsl */ `
        uniform sampler2D uMap;
        varying vec2 vUv;
        void main() {
            gl_FragColor = texture2D(uMap, vUv);
        }
    `,
)

extend({ DisplayMaterial })

declare module "@react-three/fiber" {
    interface ThreeElements {
        displayMaterial: ThreeElement<typeof DisplayMaterial>
    }
}

export type WebglSceneProps = {
    track: RefObject<HTMLElement | null>
    children: ReactNode
    camera?: PerspectiveCamera
    /**
     * - texture: children render into an FBO each frame: Global post-processing will work on it.
     * - scissor: a scissored pass painted on top of the composed frame. lighter, but excluded from global post-processing.
     */
    mode?: "texture" | "scissor"
    priority?: number
    zIndex?: number
    transparent?: boolean
}

function WebglScenePortal({
    track,
    children,
    camera: propCamera,
    mode = "scissor",
    priority,
    zIndex = 0,
    transparent = true,
}: WebglSceneProps) {
    const defaultCamera = useMemo(() => {
        const cam = new PerspectiveCamera(75, 1, 0.1, 1000)
        cam.position.z = 5
        return cam
    }, [])

    const scene = useMemo(() => new Scene(), [])
    const camera = propCamera ?? defaultCamera
    const bounds = useRef({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    })

    const gl = useThree((s) => s.gl)
    const size = useThree((s) => s.size)
    const viewport = useThree((s) => s.viewport)
    const displayMesh = useRef<Mesh>(null)
    const fbo = useFBO(1, 1, { samples: 4 })

    useLayoutEffect(() => {
        fbo.texture.colorSpace = gl.outputColorSpace
    }, [fbo, gl])

    useLayoutEffect(() => {
        const target = track.current
        if (!target) return

        const measure = () => {
            const rect = target.getBoundingClientRect()
            bounds.current.x = rect.left + window.scrollX
            bounds.current.y = rect.top + window.scrollY
            bounds.current.width = rect.width
            bounds.current.height = rect.height
        }

        measure()
        const resizeObserver = new ResizeObserver(measure)
        resizeObserver.observe(target)
        resizeObserver.observe(document.body)
        return () => resizeObserver.disconnect()
    }, [track])

    const renderPriority = priority ?? (mode === "texture" ? 0 : 2)

    useFrame(() => {
        const { x, y, width, height } = bounds.current
        if (width === 0 || height === 0) return

        const aspect = width / height
        if (camera.aspect !== aspect) {
            camera.aspect = aspect
            camera.updateProjectionMatrix()
        }

        if (mode === "scissor") {
            const viewportLeft = x - window.scrollX
            const viewportTop = y - window.scrollY
            const canvasHeight = gl.domElement.clientHeight
            const canvasWidth = gl.domElement.clientWidth

            const previousAutoClear = gl.autoClear
            gl.autoClear = false
            gl.setViewport(viewportLeft, canvasHeight - (viewportTop + height), width, height)
            gl.setScissor(viewportLeft, canvasHeight - (viewportTop + height), width, height)
            gl.setScissorTest(true)
            gl.clear()
            gl.render(scene, camera)
            gl.setScissorTest(false)
            gl.setViewport(0, 0, canvasWidth, canvasHeight)
            gl.setScissor(0, 0, canvasWidth, canvasHeight)
            gl.autoClear = previousAutoClear
            return
        }

        const pixelRatio = gl.getPixelRatio()
        const fboWidth = Math.max(1, Math.ceil(width * pixelRatio))
        const fboHeight = Math.max(1, Math.ceil(height * pixelRatio))

        if (fbo.width !== fboWidth || fbo.height !== fboHeight) {
            fbo.setSize(fboWidth, fboHeight)
        }

        const previousClearAlpha = gl.getClearAlpha()
        const previousAutoClear = gl.autoClear

        gl.autoClear = true
        gl.setRenderTarget(fbo)
        gl.setClearAlpha(transparent ? 0 : 1)
        gl.clear()
        gl.render(scene, camera)
        gl.setRenderTarget(null)
        gl.setClearAlpha(previousClearAlpha)
        gl.autoClear = previousAutoClear

        const mesh = displayMesh.current

        if (mesh) {
            const pxToWorld = viewport.height / size.height
            mesh.position.x = (x + width / 2 - window.scrollX - size.width / 2) * pxToWorld
            mesh.position.y = -(y + height / 2 - window.scrollY - size.height / 2) * pxToWorld
            mesh.scale.x = width * pxToWorld
            mesh.scale.y = height * pxToWorld
        }
    }, renderPriority)

    const portal = createPortal(children, scene, {
        camera,
        events: {
            compute: (event, state) => {
                const rect = track.current?.getBoundingClientRect()
                if (!rect) return
                state.pointer.set(
                    ((event.clientX - rect.left) / rect.width) * 2 - 1,
                    -(((event.clientY - rect.top) / rect.height) * 2 - 1),
                )
                state.raycaster.setFromCamera(state.pointer, camera)
            },
        },
    })

    return (
        <>
            {portal}
            {mode === "texture" && (
                <mesh ref={displayMesh} renderOrder={zIndex}>
                    <planeGeometry args={[1, 1]} />
                    <displayMaterial
                        key={DisplayMaterial.key}
                        uMap={fbo.texture}
                        transparent
                        premultipliedAlpha
                        depthTest={false}
                        depthWrite={false}
                    />
                </mesh>
            )}
        </>
    )
}

export function WebglScene(props: WebglSceneProps) {
    return (
        <webglTeleport.In>
            <WebglScenePortal {...props} />
        </webglTeleport.In>
    )
}
