"use client"

import { shaderMaterial, useFBO, useTexture } from "@react-three/drei"
import { createPortal, extend, type ThreeElement, useFrame, useThree } from "@react-three/fiber"
import type { Easing } from "motion"
import { animate, useMotionValue, useSpring, wrap } from "motion/react"
import {
    type ComponentRef,
    type ReactNode,
    type RefObject,
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react"
import * as THREE from "three"
import { MathUtils } from "three"
import { WebglScene, type WebglSceneProps } from "../webgl-scene/webgl-scene"

const WHEEL_STEP = 0.0025 as const
const DRAG_STEP = 0.005 as const
const DRAG_X_MULTIPLIER = 0.3 as const
const DRAG_THRESHOLD = 6 as const
const MAX_LAG = 1.5 as const
const REFERENCE_ASPECT = 16 / 9
const REVEAL_SCALE = 0.35 as const
const REVEAL_DELAY = 0.25 as const
const REVEAL_EASING = [0.4, 0.2, 0.15, 1] as Easing
const FOCUS_EASING = [0.7, 0.03, 0.26, 0.99] as Easing
const SLIDE_DURATION_RATIO = 0.4 as const
const FOCUS_FADE_KEYFRAMES = [0, 0.6, 1]
const FOCUS_GAP_RATIO = 0.06 as const
const ROW_TILE_ASPECT = 0.8 as const
const FOCUS_LENS_FLARE = 3 as const

const DEFAULT_PROPS = {
    radius: 4.5,
    tileHeight: 2.25,
    tileAspect: 1.5,
    tileCount: 16,
    verticalSpacing: 0.75,
    turnAngle: 46,
    tileRotation: 1,
    cornerRadius: 0,
    curve: 0.09,
    autoScroll: 0.1,
    easing: 0.1,
    input: "wheel" as SpiralInput,
    inputSpeed: 1.1,
    drag: true,
    scrollSpread: 0.5,
    scrollGrowth: 0.65,
    wave: 0.8,
    lensBlur: 0.24,
    reveal: true,
    revealDuration: 2,
    focusDuration: 1.6,
    focusScale: 0.7,
    autoScale: true,
    scale: 1.3,
}

type SpiralInput = "wheel" | "scroll" | "none"

type Bounds = {
    width: number
    height: number
}

type RowMetrics = {
    openAspect: number
    openWidth: number
    fitScale: number
    flatSpacing: number
}

type FrameState = {
    position: number
    tension: number
    presence: number
    spiral: number
    focus: number
    time: number
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
    activeIndex: number | null
    onSelect: (index: number | null) => void
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
    strength: RefObject<number>
    children: ReactNode
}

function PostProcessing({ bounds, strength, children }: PostProcessingProps) {
    const gl = useThree((state) => state.gl)
    const camera = useThree((state) => state.camera)
    const content = useMemo(() => new THREE.Scene(), [])
    const fbo = useFBO(1, 1, { samples: 4 })
    const blurRef = useRef<InstanceType<typeof SpiralLensBlurMaterial>>(null)

    useFrame(() => {
        if (blurRef.current) {
            blurRef.current.uStrength = strength.current
        }

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
                    ref={blurRef}
                    key={SpiralLensBlurMaterial.key}
                    uScene={fbo.texture}
                    uStrength={0}
                    transparent
                    premultipliedAlpha
                    depthTest={false}
                    depthWrite={false}
                />
            </mesh>
        </>
    )
}

function surfaceScale(bounds: Bounds, autoScale: boolean) {
    if (!autoScale || bounds.height === 0) return 1
    return Math.min(1, bounds.width / bounds.height / REFERENCE_ASPECT)
}

function rowZoom(camera: THREE.PerspectiveCamera, focusScale: number, tileHeight: number) {
    const visibleHeight = 2 * Math.tan(MathUtils.degToRad(camera.fov) / 2) * camera.position.z
    const visibleWidth = visibleHeight * camera.aspect

    return (Math.min(visibleHeight, visibleWidth / ROW_TILE_ASPECT) * focusScale) / tileHeight
}

function coverCrop(material: PlaneMesh["material"], imageAspect: number, tileAspect: number) {
    let cropX = 1
    let cropY = imageAspect / tileAspect

    if (imageAspect > tileAspect) {
        cropX = tileAspect / imageAspect
        cropY = 1
    }

    material.uUvScale.set(cropX, cropY)
    material.uUvOffset.set((1 - cropX) / 2, (1 - cropY) / 2)
}

function SpiralScene({
    sources,
    surface,
    activeIndex,
    onSelect,
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
    focusDuration,
    focusScale,
    autoScale,
    scale,
}: SpiralSceneProps) {
    const textures = useTexture(sources)
    const bounds = useSurfaceBounds(surface)
    const camera = useThree((state) => state.camera)
    const fitRef = useRef<THREE.Group>(null)
    const groupRef = useRef<THREE.Group>(null)
    const meshRefs = useRef<(PlaneMesh | null)[]>([])
    const target = useMotionValue(0)
    const scroll = useSpring(target, { visualDuration: easing, bounce: 0 })
    const progress = useRef({ presence: reveal ? 0 : 1, spiral: reveal ? 0 : 1, focus: 0 })
    const pointer = useRef({ dragging: false, moved: false, hovering: false })
    const animating = useRef(reveal)
    const tensionRef = useRef(0)
    const blurRef = useRef(lensBlur)
    const lastScrollY = useRef<number | null>(null)
    const tileCountRef = useRef(tileCount)
    tileCountRef.current = tileCount

    const applyCursor = useCallback(() => {
        const element = surface.current
        if (!element) return

        let cursor = ""

        if (drag && activeIndex === null) {
            cursor = "grab"
        }

        if (pointer.current.hovering) {
            cursor = "pointer"
        }

        if (pointer.current.dragging) {
            cursor = "grabbing"
        }

        element.style.cursor = cursor
    }, [surface, drag, activeIndex])

    const select = useCallback(
        (index: number | null) => {
            if (pointer.current.moved || animating.current) return
            onSelect(index === activeIndex ? null : index)
        },
        [onSelect, activeIndex],
    )

    useEffect(() => {
        applyCursor()
    }, [applyCursor])

    const width = tileHeight * tileAspect
    const angleStep = MathUtils.degToRad(turnAngle)
    const half = tileCount / 2
    const bandSpacing = radius * angleStep

    const tiles = useMemo(() => {
        return Array.from({ length: tileCount }, (_, index) => {
            const texture = textures[index % textures.length]
            const image = texture.image as HTMLImageElement

            return {
                texture,
                imageAspect: image.width / image.height,
                uvScale: new THREE.Vector2(1, 1),
                uvOffset: new THREE.Vector2(0, 0),
            }
        })
    }, [textures, tileCount])

    useEffect(() => {
        const element = surface.current
        if (!element || input !== "wheel" || activeIndex !== null) return

        const onWheel = (event: WheelEvent) => {
            event.preventDefault()
            target.set(target.get() + event.deltaY * WHEEL_STEP * inputSpeed)
        }
        element.addEventListener("wheel", onWheel, { passive: false })
        return () => element.removeEventListener("wheel", onWheel)
    }, [surface, target, input, inputSpeed, activeIndex])

    useEffect(() => {
        const element = surface.current
        if (!element || !drag || activeIndex !== null) return

        const origin = { x: 0, y: 0, target: 0 }

        const beginDrag = (event: PointerEvent) => {
            pointer.current.dragging = true
            pointer.current.moved = false
            origin.x = event.clientX
            origin.y = event.clientY
            origin.target = target.get()
            applyCursor()
        }

        const moveDrag = (event: PointerEvent) => {
            if (!pointer.current.dragging) return

            const sideways = event.clientX - origin.x
            const vertical = event.clientY - origin.y

            if (Math.abs(sideways) > DRAG_THRESHOLD || Math.abs(vertical) > DRAG_THRESHOLD) {
                pointer.current.moved = true
            }

            target.set(
                origin.target + (vertical - sideways * DRAG_X_MULTIPLIER) * DRAG_STEP * inputSpeed,
            )
        }

        const endDrag = () => {
            pointer.current.dragging = false
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
    }, [surface, target, drag, inputSpeed, applyCursor, activeIndex])

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") select(null)
        }

        window.addEventListener("keydown", onKeyDown)
        return () => window.removeEventListener("keydown", onKeyDown)
    }, [select])

    useEffect(() => {
        function revealAnimation() {
            const group = groupRef.current
            if (!group) return

            if (!reveal) {
                group.scale.setScalar(1)
                progress.current.presence = 1
                progress.current.spiral = 1
                animating.current = false
                return
            }

            group.scale.setScalar(REVEAL_SCALE)
            progress.current.presence = 0
            progress.current.spiral = 0
            animating.current = true

            const settings = {
                duration: revealDuration,
                ease: REVEAL_EASING,
                delay: revealDuration * REVEAL_DELAY,
                at: 0,
            }

            const controls = animate([
                [group.scale, { x: 1, y: 1, z: 1 }, settings],
                [progress.current, { presence: 1, spiral: 1 }, settings],
                [target, target.get() + tileCountRef.current, settings],
            ])

            controls.then(() => {
                animating.current = false
            })

            return () => {
                controls.stop()
                animating.current = false
            }
        }

        return revealAnimation()
    }, [reveal, revealDuration, target])

    useEffect(() => {
        const unfolded = progress.current.focus === 1
        if (activeIndex === null && !unfolded) return

        function focusAnimation() {
            const from = target.get()
            const count = tileCountRef.current

            if (activeIndex !== null && unfolded) {
                const settings = {
                    duration: focusDuration * SLIDE_DURATION_RATIO,
                    ease: FOCUS_EASING,
                }
                const travel = wrap(0, count, activeIndex - from + count / 2) - count / 2
                const controls = animate(target, from + travel, settings)

                return () => controls.stop()
            }

            const settings = { duration: focusDuration, ease: FOCUS_EASING, at: 0 }
            const opening = activeIndex !== null
            let travel = count

            if (opening) {
                travel += wrap(0, count, activeIndex - from)
            }

            const controls = animate([
                [progress.current, { spiral: opening ? 0 : 1, focus: opening ? 1 : 0 }, settings],
                [
                    progress.current,
                    { presence: [1, 0, 1] },
                    { ...settings, times: FOCUS_FADE_KEYFRAMES },
                ],
                [target, from + travel, settings],
            ])

            animating.current = true
            controls.then(() => {
                animating.current = false
            })

            return () => {
                controls.stop()
                animating.current = false
            }
        }

        return focusAnimation()
    }, [activeIndex, focusDuration, target])

    const advanceScroll = useCallback(
        (step: number) => {
            const scrollY = window.scrollY
            const scrolled = scrollY - (lastScrollY.current ?? scrollY)
            lastScrollY.current = scrollY

            if (activeIndex !== null) return

            if (input === "scroll") {
                target.set(target.get() + scrolled * WHEEL_STEP * inputSpeed)
            }

            if (!pointer.current.dragging) {
                target.set(target.get() + autoScroll * step)
            }
        },
        [activeIndex, input, inputSpeed, autoScroll, target],
    )

    const measureRow = useCallback(
        (focus: number): RowMetrics => {
            const openAspect = MathUtils.lerp(tileAspect, ROW_TILE_ASPECT, focus)
            const openWidth = tileHeight * openAspect
            const fitScale = surfaceScale(bounds.current, autoScale) * scale

            if (focus === 0 || !(camera instanceof THREE.PerspectiveCamera)) {
                return { openAspect, openWidth, fitScale, flatSpacing: bandSpacing }
            }

            return {
                openAspect,
                openWidth,
                fitScale: MathUtils.lerp(fitScale, rowZoom(camera, focusScale, tileHeight), focus),
                flatSpacing: MathUtils.lerp(bandSpacing, openWidth * (1 + FOCUS_GAP_RATIO), focus),
            }
        },
        [tileAspect, tileHeight, autoScale, scale, camera, focusScale, bandSpacing, bounds],
    )

    const layoutTiles = useCallback(
        (row: RowMetrics, frame: FrameState) => {
            const { position, tension, presence, spiral, focus, time } = frame
            const growth = 1 + tension * scrollGrowth
            const pitch = angleStep * (1 + tension * scrollSpread)
            const grownRadius = radius * growth

            meshRefs.current.forEach((mesh, index) => {
                if (!mesh) return

                const offset = wrap(0, tileCount, index - position + half) - half
                const angle = offset * pitch
                const distance = Math.abs(offset)

                const edgeFade = 1 - MathUtils.smoothstep(distance, half * 0.46, half * 0.75)
                const rowFade = 1 - MathUtils.smoothstep(distance, 1, 2)
                const opacity = MathUtils.lerp(edgeFade, rowFade, focus) * presence

                mesh.position.set(
                    MathUtils.lerp(offset * row.flatSpacing, Math.sin(angle) * grownRadius, spiral),
                    offset * verticalSpacing * growth * spiral,
                    (Math.cos(angle) * grownRadius - radius) * spiral,
                )
                mesh.rotation.y = angle * tileRotation * spiral
                mesh.scale.x = row.openAspect / tileAspect
                mesh.renderOrder = Math.round(mesh.position.z * 100)
                mesh.visible = opacity > 0.002
                mesh.material.depthWrite = opacity > 0.99

                coverCrop(mesh.material, tiles[index].imageAspect, row.openAspect)
                mesh.material.uTileSize.set(row.openWidth, tileHeight)
                mesh.material.uOpacity = opacity
                mesh.material.uCurve = curve * spiral
                mesh.material.uWave = tension * wave * (1 - focus)
                mesh.material.uTime = time
            })
        },
        [
            tiles,
            tileCount,
            half,
            angleStep,
            radius,
            scrollGrowth,
            scrollSpread,
            verticalSpacing,
            tileRotation,
            tileAspect,
            tileHeight,
            curve,
            wave,
        ],
    )

    useFrame((state, delta) => {
        const fit = fitRef.current
        if (!fit) return

        const step = Math.min(delta, 0.05)
        const { presence, spiral, focus } = progress.current

        advanceScroll(step)

        const row = measureRow(focus)
        fit.scale.setScalar(row.fitScale)
        blurRef.current = lensBlur * (1 - focus + Math.sin(focus * Math.PI) * FOCUS_LENS_FLARE)

        const position = MathUtils.lerp(scroll.get(), target.get(), focus)
        const lag = Math.min(Math.abs(target.get() - position) / MAX_LAG, 1)
        tensionRef.current = MathUtils.damp(tensionRef.current, lag, 8, step)

        layoutTiles(row, {
            position,
            tension: tensionRef.current,
            presence,
            spiral,
            focus,
            time: state.clock.elapsedTime,
        })
    })

    return (
        <PostProcessing bounds={bounds} strength={blurRef}>
            <group ref={fitRef}>
                <group
                    ref={groupRef}
                    onPointerMissed={() => select(null)}
                    onPointerOver={() => {
                        pointer.current.hovering = true
                        applyCursor()
                    }}
                    onPointerOut={() => {
                        pointer.current.hovering = false
                        applyCursor()
                    }}
                >
                    {tiles.map((tile, index) => (
                        <mesh
                            key={index}
                            ref={(mesh) => {
                                meshRefs.current[index] = mesh as PlaneMesh | null
                            }}
                            onClick={(event) => {
                                event.stopPropagation()
                                select(index)
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
    const [activeIndex, setActiveIndex] = useState<number | null>(null)
    let touch = ""

    if (sceneProps.input === "wheel" || sceneProps.drag) {
        touch = "touch-none"
    }

    return (
        <div ref={surface} className={`${touch} select-none ${className ?? ""}`}>
            <ul className="sr-only">
                {items.map((image, index) => (
                    <li key={image.src}>
                        <button
                            type="button"
                            aria-current={activeIndex === index}
                            onClick={() => setActiveIndex(index)}
                        >
                            <img src={image.src} alt={image.alt} />
                        </button>
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
                        activeIndex={activeIndex}
                        onSelect={setActiveIndex}
                    />
                </WebglScene>
            )}
        </div>
    )
}
