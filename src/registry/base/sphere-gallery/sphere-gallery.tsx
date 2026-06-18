"use client"

import { shaderMaterial, useFBO, useTexture } from "@react-three/drei"
import { createPortal, extend, type ThreeElement, useFrame, useThree } from "@react-three/fiber"
import type { Easing } from "motion"
import { animate } from "motion/react"
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

const TAU = Math.PI * 2
const MAX_TILT = Math.PI / 4
const SCENE_DISTANCE = 0.1 as const
const INITIAL_DISTANCE = 2 as const
const PEEK_DEPTH = 1.5 as const
const PEEK_MARGIN = 0.15 as const
const FOCUS_EASING = [0.7, 0.03, 0.26, 0.99] as Easing
const REVEAL_EASING = [0.4, 0.2, 0.15, 1] as Easing

const DEFAULT_PROPS = {
    rows: 7,
    columns: 12,
    latitudeRange: 85,
    gap: 0.01,
    padding: 0.03,
    cornerRadius: 0.02,
    lensBlur: 0.4,
    fov: 70,
    tileColor: "#F8F8F8" as string | null,
    sphereColor: "#ffffff" as string,
    reveal: true,
    revealDuration: 2,
    focusDuration: 1,
    focusScale: 1.7,
    mouseParallax: 0.2,
}

type LayoutTile = {
    position: THREE.Vector3
    quaternion: THREE.Quaternion
    longitude: number
    latitude: number
    width: number
    height: number
    span: THREE.Vector2
}

type TileProps = {
    texture: THREE.Texture
    tile: LayoutTile
    index: number
    activeTile: number | null
    setPointer: (on: boolean) => void
    onSelect: () => void
} & Pick<typeof DEFAULT_PROPS, "gap" | "padding" | "cornerRadius" | "tileColor" | "reveal" | "revealDuration" | "focusDuration" | "focusScale">

type PeekSlot = {
    index: number
    texture: THREE.Texture
    position: THREE.Vector3
    quaternion: THREE.Quaternion
    width: number
    height: number
}

type PeekTileProps = {
    slot: PeekSlot | null
    setPointer: (on: boolean) => void
    onNavigate: (index: number) => void
    focusDuration: number
}

type SphereSceneProps = {
    sources: string[]
    surface: RefObject<HTMLElement | null>
    activeTile: number | null
    onSelect: (index: number) => void
    onNavigate: (index: number) => void
    onDismiss: () => void
} & Omit<typeof DEFAULT_PROPS, "lensBlur">

export type SphereGalleryItem = {
    src: string
    alt: string
}

export type SphereGalleryProps = {
    items: SphereGalleryItem[]
    className?: string
    onActiveChange?: (index: number | null) => void
} & Partial<typeof DEFAULT_PROPS> &
    Pick<WebglSceneProps, "mode" | "priority" | "zIndex" | "transparent">

declare module "@react-three/fiber" {
    interface ThreeElements {
        tileMaterial: ThreeElement<typeof TileMaterial>
        lensBlurMaterial: ThreeElement<typeof LensBlurMaterial>
    }
}

/*
 * Shader material for each tile.
 * Draws the image, the rounded mask and the dissolve effect.
 */
const TileMaterial = shaderMaterial(
    {
        uMap: new THREE.Texture(),
        uFocus: 0,
        uLatitude: 0,
        uAngularSpan: new THREE.Vector2(1, 1),
        uImageAspect: 1,
        uTileSize: new THREE.Vector2(1, 1),
        uGap: 0,
        uPadding: 0.1,
        uRadius: 0.1,
        uBackground: new THREE.Color("#d4d4d4"),
        uBackgroundAlpha: 1,
        uDissolve: 0,
        uSeed: 0,
        uOpacity: 1,
        uReveal: 1,
    },
    /* glsl */ `
        uniform float uFocus;
        uniform float uLatitude;
        uniform vec2 uAngularSpan;
        varying vec2 vUv;

        void main() {
            vUv = uv;

            float longitude = (uv.x - 0.5) * uAngularSpan.x;
            float latitude = uLatitude + (uv.y - 0.5) * uAngularSpan.y;

            vec3 spherePosition = vec3(
                cos(latitude) * sin(longitude),
                sin(latitude) * cos(uLatitude) - cos(latitude) * sin(uLatitude) * cos(longitude),
                1.0 - cos(latitude) * cos(uLatitude) * cos(longitude) - sin(latitude) * sin(uLatitude)
            );

            vec3 morphedPosition = mix(spherePosition, position, uFocus);

            gl_Position = projectionMatrix * modelViewMatrix * vec4(morphedPosition, 1.0);
        }
    `,
    /* glsl */ `
        uniform sampler2D uMap;
        uniform float uImageAspect;
        uniform vec2 uTileSize;
        uniform float uGap;
        uniform float uPadding;
        uniform float uRadius;
        uniform vec3 uBackground;
        uniform float uBackgroundAlpha;
        uniform float uDissolve;
        uniform float uSeed;
        uniform float uOpacity;
        uniform float uReveal;

        varying vec2 vUv;

        float sdRoundBox(vec2 point, vec2 halfSize, float radius) {
            vec2 corner = abs(point) - halfSize + radius;
            return min(max(corner.x, corner.y), 0.0) + length(max(corner, 0.0)) - radius;
        }

        float hash(vec2 point) {
            return fract(sin(dot(point, vec2(12.9898, 78.233))) * 43758.5453);
        }

        float valueNoise(vec2 point) {
            vec2 cell = floor(point);
            vec2 offset = fract(point);
            float bottomLeft = hash(cell);
            float bottomRight = hash(cell + vec2(1.0, 0.0));
            float topLeft = hash(cell + vec2(0.0, 1.0));
            float topRight = hash(cell + vec2(1.0, 1.0));
            vec2 smoothed = offset * offset * (3.0 - 2.0 * offset);
            return mix(bottomLeft, bottomRight, smoothed.x)
                + (topLeft - bottomLeft) * smoothed.y * (1.0 - smoothed.x)
                + (topRight - bottomRight) * smoothed.x * smoothed.y;
        }

        float fbm(vec2 point) {
            float value = 0.0;
            float amplitude = 0.5;
            for (int octave = 0; octave < 3; octave++) {
                value += amplitude * valueNoise(point);
                point *= 2.0;
                amplitude *= 0.5;
            }
            return value;
        }

        void main() {
            vec2 point = (vUv - 0.5) * uTileSize;
            vec2 halfTile = uTileSize * 0.5 - uGap;
            vec2 content = halfTile - uPadding;

            float imageHalfHeight = min(content.x / uImageAspect, content.y);
            vec2 imageHalfSize = vec2(imageHalfHeight * uImageAspect, imageHalfHeight);
            vec2 imageUv = point / (imageHalfSize * 2.0) + 0.5;

            bool inside = all(greaterThanEqual(imageUv, vec2(0.0))) &&
                all(lessThanEqual(imageUv, vec2(1.0)));

            vec3 color = inside ? texture2D(uMap, imageUv).rgb : uBackground;

            float boxDistance = sdRoundBox(point, halfTile, uRadius);
            float boxAntialias = fwidth(boxDistance);
            float alpha = smoothstep(boxAntialias, -boxAntialias, boxDistance);

            alpha *= inside ? 1.0 : uBackgroundAlpha;

            if (uDissolve > 0.0) {
                float threshold = mix(-0.1, 0.95, uDissolve);
                float noise = fbm(vUv * 3.0 + uSeed * 7.13);
                float edgeDistance = noise - threshold;
                float edgeAntialias = fwidth(edgeDistance);
                alpha *= smoothstep(-edgeAntialias, edgeAntialias, edgeDistance);

                float rim = 1.0 - smoothstep(0.0, 0.1, edgeDistance);
                color += rim * 0.4;
            }

            gl_FragColor = vec4(color, alpha * uOpacity * uReveal);
        }
    `,
)

/*
 * Full-screen lens-blur shader.
 * Used by the post-processing pass over the rendered scene.
 */
const LensBlurMaterial = shaderMaterial(
    {
        uScene: new THREE.Texture(),
        uStrength: 0.16,
        uRadius: 0.3,
        uSmoothness: 0.5,
        uDispersion: 0.35,
        uMotion: 0,
        uMotionStrength: 0.4,
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
        uniform float uMotion;
        uniform float uMotionStrength;

        varying vec2 vUv;

        const int SAMPLES = 24;

        void main() {
            vec2 toCenter = vUv - 0.5;
            float distanceFromCenter = length(toCenter);

            float radius = uRadius * (1.0 - 0.7 * uMotion);
            float mask = smoothstep(radius, radius + uSmoothness, distanceFromCenter);
            float amount = mask * mask * uStrength + mask * uMotion * uMotionStrength;

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

extend({ TileMaterial, LensBlurMaterial })

type PostProcessingProps = {
    surface: RefObject<HTMLElement | null>
    children: ReactNode
    strength: number
}

/*
 * Renders the scene into an off-screen buffer.
 * Applies the lens-blur pass and tracks camera motion.
 */
function PostProcessing({ surface, children, strength }: PostProcessingProps) {
    const gl = useThree((state) => state.gl)
    const camera = useThree((state) => state.camera)
    const contentScene = useMemo(() => new THREE.Scene(), [])
    const screenRef =
        useRef<THREE.Mesh<THREE.PlaneGeometry, InstanceType<typeof LensBlurMaterial>>>(null)
    const bounds = useRef({ width: 0, height: 0 })
    const motion = useRef({ previousZ: null as number | null, strength: 0 })
    const fbo = useFBO(1, 1, { samples: 4 })

    useLayoutEffect(() => {
        const target = surface.current
        if (!target) return

        const measure = () => {
            const rect = target.getBoundingClientRect()
            bounds.current.width = rect.width
            bounds.current.height = rect.height
        }

        measure()
        const resizeObserver = new ResizeObserver(measure)
        resizeObserver.observe(target)
        return () => resizeObserver.disconnect()
    }, [surface])

    useFrame((_, delta) => {
        const screen = screenRef.current
        const { width, height } = bounds.current
        if (!screen) return
        const cameraZ = camera.position.z
        const previousZ = motion.current.previousZ
        motion.current.previousZ = cameraZ

        if (delta > 0 && previousZ !== null) {
            const speed = Math.abs(cameraZ - previousZ) / delta
            const target = Math.min(speed * 0.1, 1)
            motion.current.strength = MathUtils.damp(motion.current.strength, target, 14, delta)
            screen.material.uMotion = motion.current.strength
        }

        const pixelRatio = gl.getPixelRatio()
        const fboWidth = Math.ceil(width * pixelRatio)
        const fboHeight = Math.ceil(height * pixelRatio)
        if (fbo.width !== fboWidth || fbo.height !== fboHeight) {
            fbo.setSize(fboWidth, fboHeight)
        }

        const aspect = width / height

        if (camera instanceof THREE.PerspectiveCamera && camera.aspect !== aspect) {
            camera.aspect = aspect
            camera.updateProjectionMatrix()
        }

        const previousClearAlpha = gl.getClearAlpha()
        gl.setRenderTarget(fbo)
        gl.setClearAlpha(0)
        gl.clear()
        gl.render(contentScene, camera)
        gl.setRenderTarget(null)
        gl.setClearAlpha(previousClearAlpha)
    }, -1)

    return (
        <>
            {createPortal(children, contentScene)}

            <mesh ref={screenRef} frustumCulled={false}>
                <planeGeometry args={[2, 2]} />
                <lensBlurMaterial
                    key={LensBlurMaterial.key}
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

/*
 * One image tile placed on the sphere.
 * Handles hover, focus and dissolve transitions.
 */
function Tile({
    texture,
    tile,
    gap,
    padding,
    cornerRadius,
    tileColor,
    index,
    activeTile,
    setPointer,
    onSelect,
    reveal,
    revealDuration,
    focusDuration,
    focusScale,
}: TileProps) {
    const [hovered, setHovered] = useState(false)
    const meshRef = useRef<THREE.Mesh<THREE.PlaneGeometry, InstanceType<typeof TileMaterial>>>(null)
    const image = texture.image as HTMLImageElement
    const focused = activeTile === index
    const dissolving = activeTile !== null && !focused

    useEffect(() => {
        function tileFocusAnimation() {
            const mesh = meshRef.current
            const material = mesh?.material
            if (!mesh || !material) return

            const scale = focused ? focusScale : 1

            const controls = animate([
                [
                    material,
                    { uFocus: focused ? 1 : 0 },
                    { duration: focusDuration, ease: FOCUS_EASING },
                ],
                [
                    material,
                    { uDissolve: dissolving ? 1 : 0 },
                    { duration: focusDuration, ease: FOCUS_EASING, at: 0 },
                ],
                [
                    material,
                    { uGap: focused ? 0 : gap },
                    { duration: focusDuration, ease: FOCUS_EASING, at: 0 },
                ],
                [
                    material,
                    { uPadding: focused ? 0 : padding },
                    { duration: focusDuration, ease: FOCUS_EASING, at: 0 },
                ],
                [
                    material,
                    { uRadius: focused ? 0 : cornerRadius },
                    { duration: focusDuration, ease: FOCUS_EASING, at: 0 },
                ],
                [
                    material,
                    { uBackgroundAlpha: focused ? 0 : 1 },
                    { duration: focusDuration, ease: FOCUS_EASING, at: 0 },
                ],
                [
                    mesh.scale,
                    { x: scale, y: scale, z: scale },
                    { duration: focusDuration, ease: FOCUS_EASING, at: 0 },
                ],
            ])
            return () => controls.stop()
        }

        return tileFocusAnimation()
    }, [cornerRadius, dissolving, focused, gap, padding, tileColor, focusDuration, focusScale])

    useEffect(() => {
        if (!reveal) return
        function tileRevealAnimation() {
            const material = meshRef.current?.material
            if (!material) return
            const controls = animate(
                material,
                { uReveal: 1, uDissolve: [0.5, 0] },
                { duration: revealDuration, ease: REVEAL_EASING },
            )
            return () => controls.stop()
        }
        return tileRevealAnimation()
    }, [reveal, revealDuration])

    useEffect(() => {
        function tileHoverAnimation() {
            const material = meshRef.current?.material
            if (!material) return
            const controls = animate(
                material,
                { uOpacity: hovered && !focused ? 0.7 : 1 },
                { duration: hovered && !focused ? 0.2 : 0.3 },
            )
            return () => controls.stop()
        }

        return tileHoverAnimation()
    }, [hovered, focused])

    return (
        <mesh
            ref={meshRef}
            position={tile.position}
            quaternion={tile.quaternion}
            raycast={focused || activeTile === null ? THREE.Mesh.prototype.raycast : () => null}
            onClick={(event) => {
                event.stopPropagation()
                onSelect()
                setPointer(false)
            }}
            onPointerOver={(event) => {
                event.stopPropagation()
                setHovered(true)
                setPointer(!focused)
            }}
            onPointerOut={() => {
                setHovered(false)
                setPointer(false)
            }}
        >
            <planeGeometry args={[tile.width, tile.height, 24, 24]} />
            <tileMaterial
                key={TileMaterial.key}
                uMap={texture}
                uDissolve={0}
                uReveal={0}
                uLatitude={tile.latitude}
                uAngularSpan={tile.span}
                uImageAspect={image.width / image.height}
                uTileSize={new THREE.Vector2(tile.width, tile.height)}
                uGap={gap}
                uPadding={padding}
                uRadius={cornerRadius}
                uBackground={new THREE.Color(tileColor ?? "#000000")}
                uBackgroundAlpha={tileColor ? 1 : 0}
                uSeed={index}
                side={THREE.DoubleSide}
                transparent
                depthWrite={false}
            />
        </mesh>
    )
}

/*
 * Peek tile preview shown beside once a tile is focused.
 * Lets the user navigate to the previous or next image.
 */
function PeekTile({ slot, setPointer, onNavigate, focusDuration }: PeekTileProps) {
    const [displayedTile, setDisplayedTile] = useState<PeekSlot | null>(null)
    const [hovered, setHovered] = useState(false)

    const meshRef = useRef<THREE.Mesh<THREE.PlaneGeometry, InstanceType<typeof TileMaterial>>>(null)
    const image = displayedTile?.texture.image as HTMLImageElement

    useEffect(() => {
        function peekTileDissolveAnimation() {
            const material = meshRef.current?.material

            if (displayedTile !== slot) {
                if (!material || displayedTile?.index === slot?.index) {
                    setDisplayedTile(slot)
                    return
                }

                const controls = animate(
                    material,
                    { uDissolve: 1 },
                    { duration: focusDuration * 0.8, ease: FOCUS_EASING },
                )
                controls.then(() => setDisplayedTile(slot))
                return () => {
                    controls.stop()
                }
            }

            if (!material) return

            const controls = animate(
                material,
                { uDissolve: 0 },
                { duration: focusDuration * 0.8, ease: FOCUS_EASING },
            )
            return () => controls.stop()
        }
        return peekTileDissolveAnimation()
    }, [slot, displayedTile, focusDuration])

    useEffect(() => {
        function tileHoverAnimation() {
            const material = meshRef.current?.material
            if (!material) return
            const controls = animate(
                material,
                { uOpacity: hovered ? 0.7 : 1 },
                { duration: hovered ? 0.2 : 0.3 },
            )
            return () => controls.stop()
        }

        return tileHoverAnimation()
    }, [hovered])

    if (displayedTile === null) return null

    return (
        <mesh
            ref={meshRef}
            position={displayedTile.position}
            quaternion={displayedTile.quaternion}
            onClick={(event) => {
                event.stopPropagation()
                onNavigate(displayedTile.index)
            }}
            onPointerOver={(event) => {
                event.stopPropagation()
                setHovered(true)
                setPointer(true)
            }}
            onPointerOut={() => {
                setHovered(false)
                setPointer(false)
            }}
        >
            <planeGeometry args={[displayedTile.width, displayedTile.height]} />
            <tileMaterial
                uMap={displayedTile.texture}
                uFocus={1}
                uDissolve={1}
                uImageAspect={image.width / image.height}
                uTileSize={new THREE.Vector2(displayedTile.width, displayedTile.height)}
                uPadding={0}
                uRadius={0}
                uBackgroundAlpha={0}
                uSeed={displayedTile.index}
                side={THREE.DoubleSide}
                transparent
                depthWrite={false}
            />
        </mesh>
    )
}

/*
 * Builds the sphere tile layout.
 * Handles drag rotation, the reveal and focus animations.
 */
function SphereScene({
    sources,
    surface,
    activeTile,
    onSelect,
    onNavigate,
    onDismiss,
    rows,
    columns,
    latitudeRange,
    gap,
    padding,
    cornerRadius,
    tileColor,
    sphereColor,
    fov,
    reveal,
    revealDuration,
    focusDuration,
    focusScale,
    mouseParallax,
}: SphereSceneProps) {
    const [revealComplete, setRevealComplete] = useState(false)
    const orientation = useRef({
        spin: 0,
        tilt: 0,
        targetSpin: 0,
        targetTilt: 0,
    }).current
    const pointerOffset = useRef(new THREE.Vector2())
    const parallax = useRef(new THREE.Vector2())
    const dragMoved = useRef(false)
    const dragging = useRef(false)
    const pointerOnTile = useRef(false)
    const animating = useRef(false)
    const groupRef = useRef<THREE.Group>(null)
    const textures = useTexture(sources)
    const camera = useThree((state) => state.camera)
    const size = useThree((state) => state.size)

    const setPointer = useCallback(
        (on: boolean) => {
            pointerOnTile.current = on
            const element = surface.current
            if (!element || dragging.current) return
            element.style.cursor = on ? "pointer" : ""
        },
        [surface],
    )

    const focusDistanceFor = useCallback(
        (tile: LayoutTile) => {
            const tileSize = Math.max(tile.width, tile.height) * 1.9
            return tileSize / 2 / Math.tan(MathUtils.degToRad(fov) / 2)
        },
        [fov],
    )

    const tileLayout = useMemo(() => {
        const tiles: LayoutTile[] = []

        const orienter = new THREE.Object3D()
        const latRange = MathUtils.degToRad(latitudeRange)
        const latSpan = (latRange * 2) / rows

        for (let row = 0; row < rows; row++) {
            const latitude = -latRange + (row + 0.5) * latSpan
            const cosLat = Math.cos(latitude)

            const ringColumns = Math.max(1, Math.round(columns * cosLat))
            const lonSpan = TAU / ringColumns
            const span = new THREE.Vector2(lonSpan, latSpan)

            for (let col = 0; col < ringColumns; col++) {
                const longitude = (col + (row % 2) / 2) * lonSpan

                const position = new THREE.Vector3(
                    cosLat * Math.cos(longitude),
                    Math.sin(latitude),
                    cosLat * Math.sin(longitude),
                )

                orienter.position.copy(position)
                orienter.lookAt(0, 0, 0)

                tiles.push({
                    position,
                    quaternion: orienter.quaternion.clone(),
                    longitude,
                    latitude,
                    width: lonSpan * cosLat,
                    height: latSpan,
                    span,
                })
            }
        }

        return tiles
    }, [rows, columns, latitudeRange])

    const select = (index: number) => {
        if (dragMoved.current) return
        onSelect(index)
    }

    const navigate = (index: number) => {
        if (dragMoved.current) return
        onNavigate(index)
    }

    const peekSlots = useMemo(() => {
        if (activeTile === null) return { previous: null, next: null }

        const focused = tileLayout[activeTile]
        const sideAxis = new THREE.Vector3(1, 0, 0).applyQuaternion(focused.quaternion)
        const depthAxis = new THREE.Vector3(0, 0, 1).applyQuaternion(focused.quaternion)
        const total = tileLayout.length

        const peekDistance = focusDistanceFor(focused) + focused.width * PEEK_DEPTH
        const sideOffset =
            Math.tan(MathUtils.degToRad(fov) / 2) * peekDistance * (size.width / size.height) -
            focused.width / 2 -
            focused.width * PEEK_MARGIN

        const slot = (side: number): PeekSlot => {
            const index = (activeTile + side + total) % total
            const neighbor = tileLayout[index]
            return {
                index,
                texture: textures[index % textures.length],
                position: focused.position
                    .clone()
                    .addScaledVector(sideAxis, side * sideOffset)
                    .addScaledVector(depthAxis, -focused.width * PEEK_DEPTH),
                quaternion: focused.quaternion,
                width: neighbor.width,
                height: neighbor.height,
            }
        }

        return {
            previous: slot(-1),
            next: slot(1),
        }
    }, [activeTile, tileLayout, textures, focusDistanceFor, fov, size.width, size.height])

    useEffect(() => {
        const element = surface.current
        if (!element) return

        const drag = { active: false, x: 0, y: 0, spin: 0, tilt: 0 }
        const DRAG_THRESHOLD = 6

        const beginDrag = (event: PointerEvent) => {
            drag.active = true
            drag.x = event.clientX
            drag.y = event.clientY
            drag.spin = orientation.targetSpin
            drag.tilt = orientation.targetTilt
            dragMoved.current = false
        }

        const rotate = (event: PointerEvent) => {
            const rect = element.getBoundingClientRect()

            pointerOffset.current.set(
                MathUtils.clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1, 1),
                MathUtils.clamp(((event.clientY - rect.top) / rect.height) * 2 - 1, -1, 1),
            )

            if (!drag.active) return

            const deltaX = event.clientX - drag.x
            const deltaY = event.clientY - drag.y

            if (Math.abs(deltaX) > DRAG_THRESHOLD || Math.abs(deltaY) > DRAG_THRESHOLD) {
                dragMoved.current = true
            }

            if (activeTile !== null) return

            if (dragMoved.current && !dragging.current) {
                dragging.current = true
                element.style.cursor = "grabbing"
            }
            const width = element.offsetWidth

            orientation.targetSpin = drag.spin - (deltaX / width) * TAU
            orientation.targetTilt = MathUtils.clamp(
                drag.tilt - (deltaY / width) * Math.PI,
                -MAX_TILT,
                MAX_TILT,
            )
        }

        const endDrag = () => {
            drag.active = false
            dragging.current = false
            element.style.cursor = pointerOnTile.current ? "pointer" : ""
        }

        element.addEventListener("pointerdown", beginDrag)
        window.addEventListener("pointermove", rotate)
        window.addEventListener("pointerup", endDrag)
        window.addEventListener("pointercancel", endDrag)

        return () => {
            element.removeEventListener("pointerdown", beginDrag)
            window.removeEventListener("pointermove", rotate)
            window.removeEventListener("pointerup", endDrag)
            window.removeEventListener("pointercancel", endDrag)
        }
    }, [surface, activeTile, orientation])

    useEffect(() => {
        if (!reveal) return

        function revealSequenceAnimation() {
            camera.position.z = INITIAL_DISTANCE
            if (camera instanceof THREE.PerspectiveCamera && camera.fov !== fov) {
                camera.fov = fov

                camera.updateProjectionMatrix()
            }
            const group = groupRef.current

            if (!group) return

            const controls = animate([
                [
                    group.scale,
                    { x: 1, y: 1, z: 1 },
                    { duration: revealDuration, ease: REVEAL_EASING },
                ],
                [
                    group.rotation,
                    { x: 0 },
                    { duration: revealDuration, ease: REVEAL_EASING, at: 0 },
                ],
                [
                    group.rotation,
                    { y: 0 },
                    { duration: revealDuration, ease: REVEAL_EASING, at: 0 },
                ],
                [
                    camera.position,
                    { z: SCENE_DISTANCE },
                    {
                        duration: revealDuration * 0.7,
                        ease: FOCUS_EASING,
                        at: revealDuration * 0.7,
                    },
                ],
            ])

            controls.then(() => {
                pointerOffset.current.set(0, 0)
                setRevealComplete(true)
            })

            return () => {
                controls.stop()
            }
        }

        return revealSequenceAnimation()
    }, [camera, fov, reveal, revealDuration])

    useEffect(() => {
        function focusOnTileSequence() {
            if (!revealComplete) return
            const group = groupRef.current
            if (!group) return

            const focused = activeTile !== null ? tileLayout[activeTile] : null

            animating.current = true

            let spinAngle = group.rotation.y
            let tiltAngle = 0
            let zDistance = SCENE_DISTANCE * Math.max(1, size.height / size.width)
            let parallaxX = pointerOffset.current.x * mouseParallax
            let parallaxY = pointerOffset.current.y * mouseParallax

            if (focused) {
                const spin = focused.longitude + Math.PI / 2
                spinAngle = spin + Math.round((group.rotation.y - spin) / TAU) * TAU
                tiltAngle = -focused.latitude
                zDistance = focusDistanceFor(focused) - 1
                parallaxX = 0
                parallaxY = 0
            }

            const controls = animate([
                [
                    group.rotation,
                    {
                        x: [group.rotation.x, tiltAngle + parallaxY],
                        y: [group.rotation.y, spinAngle + parallaxX],
                    },
                    { duration: focusDuration, ease: FOCUS_EASING },
                ],
                [
                    camera.position,
                    { z: [camera.position.z, zDistance] },
                    { duration: focusDuration, ease: FOCUS_EASING, at: 0 },
                ],
            ])

            controls.then(() => {
                animating.current = false
                parallax.current.set(parallaxX, parallaxY)
                orientation.spin = group.rotation.y - parallax.current.x
                orientation.tilt = group.rotation.x - parallax.current.y
                orientation.targetSpin = orientation.spin
                orientation.targetTilt = tiltAngle
            })

            return () => controls.stop()
        }

        return focusOnTileSequence()
    }, [
        revealComplete,
        camera,
        focusDistanceFor,
        activeTile,
        tileLayout,
        orientation,
        size,
        focusDuration,
        mouseParallax,
    ])

    useFrame((_state, delta) => {
        const group = groupRef.current

        if (!group) return

        if (revealComplete && activeTile === null && !animating.current) {
            orientation.spin = MathUtils.damp(orientation.spin, orientation.targetSpin, 12, delta)
            orientation.tilt = MathUtils.damp(orientation.tilt, orientation.targetTilt, 12, delta)

            const offset = pointerOffset.current

            parallax.current.x = MathUtils.damp(
                parallax.current.x,
                offset.x * mouseParallax,
                4,
                delta,
            )
            parallax.current.y = MathUtils.damp(
                parallax.current.y,
                offset.y * mouseParallax,
                4,
                delta,
            )

            group.rotation.set(
                orientation.tilt + parallax.current.y,
                orientation.spin + parallax.current.x,
                0,
            )
        }
    })

    return (
        <group rotation-x={1} rotation-y={3} scale={0.5} ref={groupRef} onPointerMissed={onDismiss}>
            <mesh>
                <sphereGeometry args={[0.99, 64, 64]} />

                <meshBasicMaterial transparent={true} opacity={0.5} color={sphereColor} />
            </mesh>

            {tileLayout.map((tile, i) => (
                <Tile
                    key={i}
                    texture={textures[i % textures.length]}
                    tile={tile}
                    gap={gap}
                    padding={padding}
                    cornerRadius={cornerRadius}
                    tileColor={tileColor}
                    index={i}
                    activeTile={activeTile}
                    setPointer={setPointer}
                    onSelect={() => select(i)}
                    reveal={reveal}
                    revealDuration={revealDuration}
                    focusDuration={focusDuration}
                    focusScale={focusScale}
                />
            ))}

            <PeekTile
                slot={peekSlots.previous}
                setPointer={setPointer}
                onNavigate={navigate}
                focusDuration={focusDuration}
            />
            <PeekTile
                slot={peekSlots.next}
                setPointer={setPointer}
                onNavigate={navigate}
                focusDuration={focusDuration}
            />
        </group>
    )
}

/*
 * Public component for the gallery.
 * Takes the images, the overlay slot and renders the WebGL scene.
 */
export function SphereGallery({
    items,
    className,
    onActiveChange,
    mode,
    priority,
    zIndex,
    transparent,
    ...rest
}: SphereGalleryProps) {
    const surface = useRef<ComponentRef<"div">>(null)
    const { lensBlur, ...sceneProps } = { ...DEFAULT_PROPS, ...rest }
    const [activeTile, setActiveTile] = useState<number | null>(null)

    const allyIndex = activeTile === null ? null : activeTile % items.length

    const select = useCallback((index: number) => {
        setActiveTile((current) => (current !== null ? null : index))
    }, [])

    const dismiss = useCallback(() => {
        setActiveTile(null)
    }, [])

    useEffect(() => {
        onActiveChange?.(allyIndex)
    }, [allyIndex, onActiveChange])

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") dismiss()
        }
        window.addEventListener("keydown", onKeyDown)

        return () => {
            window.removeEventListener("keydown", onKeyDown)
        }
    }, [dismiss])

    return (
        <div ref={surface} className={`touch-none select-none ${className ?? ""}`}>
            {/* Basic SEO/accessibility layer */}
            <ul className="sr-only">
                {items.map((image, index) => (
                    <li key={image.src}>
                        <button
                            type="button"
                            aria-current={allyIndex === index}
                            onClick={() => {
                                if (activeTile !== null) setActiveTile(index)
                                else select(index)
                            }}
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
                >
                    <PostProcessing surface={surface} strength={lensBlur}>
                        <SphereScene
                            {...sceneProps}
                            sources={items.map((image) => image.src)}
                            surface={surface}
                            activeTile={activeTile}
                            onSelect={select}
                            onNavigate={setActiveTile}
                            onDismiss={dismiss}
                        />
                    </PostProcessing>
                </WebglScene>
            )}
        </div>
    )
}
