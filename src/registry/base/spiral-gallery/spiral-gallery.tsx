"use client"

import { shaderMaterial, useFBO, useTexture } from "@react-three/drei"
import { createPortal, extend, type ThreeElement, useFrame, useThree } from "@react-three/fiber"
import { animate, type Easing, useMotionValue, useSpring } from "motion/react"
import {
    type ComponentRef,
    type ReactNode,
    type RefObject,
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
} from "react"
import * as THREE from "three"
import { WebglScene, type WebglSceneProps } from "../webgl-scene/webgl-scene"

const WHEEL_STEP = 0.0025 as const
const DRAG_STEP = 0.005 as const
const DRAG_SIDEWAYS = 0.3 as const
const MAX_LAG = 1.5 as const
const REFERENCE_ASPECT = 16 / 9
const REVEAL_SCALE = 0.35 as const
const REVEAL_DELAY = 0.25 as const
const REVEAL_EASING = [0.4, 0.2, 0.15, 1] as Easing

const DEFAULT_PROPS = {
    radius: 4.5,
    tileHeight: 2.25,
    tileAspect: 1.5,
    tileCount: 15,
    verticalSpacing: 0.95,
    turnAngle: 46,
    tileRotation: 1,
    cornerRadius: 0.05,
    curve: 0.1,
    autoScroll: 0.1,
    easing: 0.1,
    input: "wheel" as SpiralInput,
    inputSpeed: 1.1,
    drag: true,
    scrollSpread: 0.3,
    scrollGrowth: 0.65,
    wave: 0.8,
    lensBlur: 0.24,
    reveal: true,
    revealDuration: 2,
    autoScale: true,
    scale: 1.3,
}

type SpiralInput = "wheel" | "scroll" | "none"

type Bounds = {
    width: number
    height: number
}

export type SpiralGalleryItem = {
    src: string
    alt: string
}

export type SpiralGalleryProps = {
    items: SpiralGalleryItem[]
    className?: string
} & Partial<typeof DEFAULT_PROPS> &
    Pick<WebglSceneProps, "mode" | "priority" | "zIndex" | "transparent" | "autoReflow">

type SpiralSceneProps = {
    sources: string[]
    surface: RefObject<HTMLElement | null>
} & typeof DEFAULT_PROPS

type PlaneMesh = THREE.Mesh<THREE.PlaneGeometry, InstanceType<typeof SpiralTileMaterial>>

declare module "@react-three/fiber" {
    interface ThreeElements {
        spiralTileMaterial: ThreeElement<typeof SpiralTileMaterial>
        spiralLensBlurMaterial: ThreeElement<typeof SpiralLensBlurMaterial>
    }
}

const SpiralTileMaterial = shaderMaterial(
    {
        uMap: new THREE.Texture(),
        uTileSize: new THREE.Vector2(1, 1),
        uUvScale: new THREE.Vector2(1, 1),
        uUvOffset: new THREE.Vector2(0, 0),
        uRadius: 0,
        uCurve: 0,
        uOpacity: 1,
        uWave: 0,
        uTime: 0,
    },
    /* glsl */ `
        uniform float uCurve;
        uniform float uWave;
        uniform float uTime;
        varying vec2 vUv;
        void main() {
            vUv = uv;
            vec3 transformed = position;
            transformed.z -= uCurve * position.x * position.x;
            transformed.z -= (0.5 + 0.5 * cos(position.x * 1.1 + uTime * 1.5)) * uWave;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
        }
    `,
    /* glsl */ `
        uniform sampler2D uMap;
        uniform vec2 uTileSize;
        uniform vec2 uUvScale;
        uniform vec2 uUvOffset;
        uniform float uRadius;
        uniform float uOpacity;
        varying vec2 vUv;

        float sdRoundBox(vec2 point, vec2 halfSize, float radius) {
            vec2 corner = abs(point) - halfSize + radius;
            return min(max(corner.x, corner.y), 0.0) + length(max(corner, 0.0)) - radius;
        }

        void main() {
            vec2 baseUv = uUvOffset + vUv * uUvScale;
            vec4 texel = texture2D(uMap, baseUv);

            vec2 point = (vUv - 0.5) * uTileSize;
            vec2 halfSize = uTileSize * 0.5;
            float radius = min(uRadius, min(halfSize.x, halfSize.y));
            float boxDistance = sdRoundBox(point, halfSize, radius);
            float boxAntialias = fwidth(boxDistance);
            float mask = smoothstep(boxAntialias, -boxAntialias, boxDistance);

            gl_FragColor = vec4(texel.rgb, texel.a * mask * uOpacity);
        }
    `,
)

const SpiralLensBlurMaterial = shaderMaterial(
    {
        uScene: new THREE.Texture(),
        uStrength: 0,
        uRadius: 0.18,
        uSmoothness: 0.5,
        uDispersion: 0.35,
    },
    /* glsl */ `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = vec4(position.xy, 0.0, 1.0);
        }
    `,
    /* glsl */ `
        uniform sampler2D uScene;
        uniform float uStrength;
        uniform float uRadius;
        uniform float uSmoothness;
        uniform float uDispersion;

        varying vec2 vUv;

        const int SAMPLES = 24;

        void main() {
            vec2 toCenter = vUv - 0.5;
            float distanceFromCenter = length(toCenter);

            float mask = smoothstep(uRadius, uRadius + uSmoothness, distanceFromCenter);
            float amount = mask * mask * uStrength;

            if (amount <= 0.0) {
                gl_FragColor = texture2D(uScene, vUv);
                return;
            }

            vec3 color = vec3(0.0);
            float alpha = 0.0;
            float total = 0.0;

            for (int sampleIndex = 0; sampleIndex < SAMPLES; sampleIndex++) {
                float progress = float(sampleIndex) / float(SAMPLES - 1);
                float weight = 1.0 - progress * 0.6;

                float scale = 1.0 - amount * progress;
                float spread = uDispersion * amount * progress;

                vec4 mid = texture2D(uScene, 0.5 + toCenter * scale);
                color.r += texture2D(uScene, 0.5 + toCenter * (scale + spread)).r * weight;
                color.g += mid.g * weight;
                color.b += texture2D(uScene, 0.5 + toCenter * (scale - spread)).b * weight;
                alpha += mid.a * weight;

                total += weight;
            }

            gl_FragColor = vec4(color / total, alpha / total);
        }
    `,
)

extend({ SpiralTileMaterial, SpiralLensBlurMaterial })

function useSurfaceBounds(surface: RefObject<HTMLElement | null>) {
    const bounds = useRef<Bounds>({ width: 0, height: 0 })

    useLayoutEffect(() => {
        const element = surface.current
        if (!element) return

        const measure = () => {
            const rect = element.getBoundingClientRect()
            bounds.current.width = rect.width
            bounds.current.height = rect.height
        }

        measure()
        const observer = new ResizeObserver(measure)
        observer.observe(element)
        return () => observer.disconnect()
    }, [surface])

    return bounds
}

type PostProcessingProps = {
    bounds: RefObject<Bounds>
    strength: number
    children: ReactNode
}

function PostProcessing({ bounds, strength, children }: PostProcessingProps) {
    const gl = useThree((state) => state.gl)
    const camera = useThree((state) => state.camera)
    const content = useMemo(() => new THREE.Scene(), [])
    const fbo = useFBO(1, 1, { samples: 4 })

    useFrame(() => {
        const { width, height } = bounds.current
        if (width === 0 || height === 0) return

        const pixelRatio = gl.getPixelRatio()
        const fboWidth = Math.max(1, Math.ceil(width * pixelRatio))
        const fboHeight = Math.max(1, Math.ceil(height * pixelRatio))
        if (fbo.width !== fboWidth || fbo.height !== fboHeight) {
            fbo.setSize(fboWidth, fboHeight)
        }

        const previousClearAlpha = gl.getClearAlpha()
        gl.setRenderTarget(fbo)
        gl.setClearAlpha(0)
        gl.clear()
        gl.render(content, camera)
        gl.setRenderTarget(null)
        gl.setClearAlpha(previousClearAlpha)
    }, -1)

    return (
        <>
            {createPortal(children, content)}

            <mesh frustumCulled={false}>
                <planeGeometry args={[2, 2]} />
                <spiralLensBlurMaterial
                    key={SpiralLensBlurMaterial.key}
                    uScene={fbo.texture}
                    uStrength={strength}
                    transparent
                    premultipliedAlpha
                    depthTest={false}
                    depthWrite={false}
                />
            </mesh>
        </>
    )
}

function smoothstep(edge0: number, edge1: number, x: number) {
    const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)))
    return t * t * (3 - 2 * t)
}

function wrap(value: number, span: number) {
    return ((value % span) + span) % span
}

function SpiralScene({
    sources,
    surface,
    radius,
    tileHeight,
    tileAspect,
    tileCount,
    verticalSpacing,
    turnAngle,
    tileRotation,
    cornerRadius,
    curve,
    autoScroll,
    easing,
    input,
    inputSpeed,
    drag,
    scrollSpread,
    scrollGrowth,
    wave,
    lensBlur,
    reveal,
    revealDuration,
    autoScale,
    scale,
}: SpiralSceneProps) {
    const textures = useTexture(sources)
    const bounds = useSurfaceBounds(surface)
    const fitRef = useRef<THREE.Group>(null)
    const groupRef = useRef<THREE.Group>(null)
    const meshRefs = useRef<(PlaneMesh | null)[]>([])
    const target = useMotionValue(0)
    const scroll = useSpring(target, { visualDuration: easing, bounce: 0 })
    const morphRef = useRef({ value: reveal ? 0 : 1 })
    const tensionRef = useRef(0)
    const lastScrollY = useRef<number | null>(null)
    const dragging = useRef(false)
    const tileCountRef = useRef(tileCount)
    tileCountRef.current = tileCount

    const applyCursor = useCallback(() => {
        const element = surface.current
        if (!element) return

        let cursor = ""

        if (drag) {
            cursor = "grab"
        }

        if (dragging.current) {
            cursor = "grabbing"
        }

        element.style.cursor = cursor
    }, [surface, drag])

    useEffect(() => {
        applyCursor()
    }, [applyCursor])

    const width = tileHeight * tileAspect
    const angleStep = THREE.MathUtils.degToRad(turnAngle)
    const half = tileCount / 2
    const bandSpacing = radius * angleStep

    const tiles = useMemo(() => {
        return Array.from({ length: tileCount }, (_, index) => {
            const texture = textures[index % textures.length]
            const image = texture.image as HTMLImageElement
            const imageAspect = image.width / image.height

            const uvScale = new THREE.Vector2(1, imageAspect / tileAspect)

            if (imageAspect > tileAspect) {
                uvScale.set(tileAspect / imageAspect, 1)
            }

            const uvOffset = new THREE.Vector2((1 - uvScale.x) / 2, (1 - uvScale.y) / 2)

            return { texture, uvScale, uvOffset }
        })
    }, [textures, tileCount, tileAspect])

    useEffect(() => {
        const element = surface.current
        if (!element || input !== "wheel") return

        const onWheel = (event: WheelEvent) => {
            event.preventDefault()
            target.set(target.get() + event.deltaY * WHEEL_STEP * inputSpeed)
        }
        element.addEventListener("wheel", onWheel, { passive: false })
        return () => element.removeEventListener("wheel", onWheel)
    }, [surface, target, input, inputSpeed])

    useEffect(() => {
        const element = surface.current
        if (!element || !drag) return

        const origin = { x: 0, y: 0, target: 0 }

        const beginDrag = (event: PointerEvent) => {
            dragging.current = true
            origin.x = event.clientX
            origin.y = event.clientY
            origin.target = target.get()
            applyCursor()
        }

        const moveDrag = (event: PointerEvent) => {
            if (!dragging.current) return

            const moved = event.clientY - origin.y - (event.clientX - origin.x) * DRAG_SIDEWAYS
            target.set(origin.target + moved * DRAG_STEP * inputSpeed)
        }

        const endDrag = () => {
            dragging.current = false
            applyCursor()
        }

        element.addEventListener("pointerdown", beginDrag)
        window.addEventListener("pointermove", moveDrag)
        window.addEventListener("pointerup", endDrag)
        window.addEventListener("pointercancel", endDrag)

        return () => {
            endDrag()
            element.removeEventListener("pointerdown", beginDrag)
            window.removeEventListener("pointermove", moveDrag)
            window.removeEventListener("pointerup", endDrag)
            window.removeEventListener("pointercancel", endDrag)
        }
    }, [surface, target, drag, inputSpeed, applyCursor])

    useEffect(() => {
        function revealAnimation() {
            const group = groupRef.current
            if (!group) return

            if (!reveal) {
                group.scale.setScalar(1)
                morphRef.current.value = 1
                return
            }

            group.scale.setScalar(REVEAL_SCALE)
            morphRef.current.value = 0

            const settings = {
                duration: revealDuration,
                ease: REVEAL_EASING,
                delay: revealDuration * REVEAL_DELAY,
                at: 0,
            }

            const controls = animate([
                [group.scale, { x: 1, y: 1, z: 1 }, settings],
                [morphRef.current, { value: 1 }, settings],
                [target, target.get() + tileCountRef.current / 2, settings],
            ])

            return () => controls.stop()
        }

        return revealAnimation()
    }, [reveal, revealDuration, target])

    useFrame((state, delta) => {
        const fit = fitRef.current
        if (!fit) return

        const step = Math.min(delta, 0.05)
        const time = state.clock.elapsedTime
        const morph = morphRef.current.value

        const { width: surfaceWidth, height: surfaceHeight } = bounds.current
        let responsive = 1

        if (autoScale && surfaceHeight > 0) {
            responsive = Math.min(1, surfaceWidth / surfaceHeight / REFERENCE_ASPECT)
        }

        fit.scale.setScalar(responsive * scale)

        const scrollY = window.scrollY
        const scrolled = scrollY - (lastScrollY.current ?? scrollY)
        lastScrollY.current = scrollY

        if (input === "scroll") {
            target.set(target.get() + scrolled * WHEEL_STEP * inputSpeed)
        }

        if (!dragging.current) {
            target.set(target.get() + autoScroll * step)
        }

        const position = scroll.get()
        const lag = Math.min(Math.abs(target.get() - position) / MAX_LAG, 1)
        tensionRef.current = THREE.MathUtils.damp(tensionRef.current, lag, 8, step)

        const tension = tensionRef.current
        const growth = 1 + tension * scrollGrowth
        const pitch = angleStep * (1 + tension * scrollSpread)
        const grownRadius = radius * growth

        for (let index = 0; index < meshRefs.current.length; index++) {
            const mesh = meshRefs.current[index]
            if (!mesh) continue

            const offset = wrap(index - position + half, tileCount) - half
            const angle = offset * pitch
            const edgeFade = 1 - smoothstep(half * 0.46, half * 0.75, Math.abs(offset))

            mesh.position.set(
                THREE.MathUtils.lerp(offset * bandSpacing, Math.sin(angle) * grownRadius, morph),
                offset * verticalSpacing * growth * morph,
                (Math.cos(angle) * grownRadius - radius) * morph,
            )
            mesh.rotation.y = angle * tileRotation * morph

            mesh.material.uOpacity = edgeFade * morph
            mesh.material.uCurve = curve * morph
            mesh.material.uWave = tension * wave
            mesh.material.uTime = time
            mesh.renderOrder = Math.round(mesh.position.z * 100)
        }
    })

    return (
        <PostProcessing bounds={bounds} strength={lensBlur}>
            <group ref={fitRef}>
                <group ref={groupRef}>
                    {tiles.map((tile, index) => (
                        <mesh
                            key={index}
                            ref={(mesh) => {
                                meshRefs.current[index] = mesh as PlaneMesh | null
                            }}
                        >
                            <planeGeometry args={[width, tileHeight, 24, 2]} />
                            <spiralTileMaterial
                                key={SpiralTileMaterial.key}
                                uMap={tile.texture}
                                uTileSize={new THREE.Vector2(width, tileHeight)}
                                uUvScale={tile.uvScale}
                                uUvOffset={tile.uvOffset}
                                uRadius={cornerRadius}
                                uOpacity={0}
                                side={THREE.DoubleSide}
                                transparent
                                depthWrite={false}
                            />
                        </mesh>
                    ))}
                </group>
            </group>
        </PostProcessing>
    )
}

export function SpiralGallery({
    items,
    className,
    mode,
    priority,
    zIndex,
    transparent,
    autoReflow,
    ...rest
}: SpiralGalleryProps) {
    const surface = useRef<ComponentRef<"div">>(null)
    const sceneProps = { ...DEFAULT_PROPS, ...rest }
    let touch = ""

    if (sceneProps.input === "wheel" || sceneProps.drag) {
        touch = "touch-none"
    }

    return (
        <div ref={surface} className={`${touch} select-none ${className ?? ""}`}>
            <ul className="sr-only">
                {items.map((image) => (
                    <li key={image.src}>
                        <img src={image.src} alt={image.alt} />
                    </li>
                ))}
            </ul>

            {items.length > 0 && (
                <WebglScene
                    track={surface}
                    mode={mode}
                    priority={priority}
                    zIndex={zIndex}
                    transparent={transparent}
                    autoReflow={autoReflow}
                >
                    <SpiralScene
                        {...sceneProps}
                        surface={surface}
                        sources={items.map((image) => image.src)}
                    />
                </WebglScene>
            )}
        </div>
    )
}
