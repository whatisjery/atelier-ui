"use client"

import { shaderMaterial, useTexture } from "@react-three/drei"
import { extend, type ThreeElement, useFrame } from "@react-three/fiber"
import type { Easing } from "motion"
import { animate } from "motion/react"
import {
    type ComponentRef,
    type RefObject,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react"
import * as THREE from "three"
import { useWebglReady } from "../webgl-provider/webgl-provider"
import { WebglScene, type WebglSceneProps } from "../webgl-scene/webgl-scene"

const TAU = Math.PI * 2
const ANIMATION_EASING = [0.7, 0, 0.1, 1] as Easing
const REVEAL_SPEED_BOOST = 50
const SELECT_SPEED_BOOST = 10
const RING_DOWNSCALE = 0.8
const TILE_ASPECT = 0.8
const FOCUS_TILE_SIZE = 5
const FOCUS_TILE_HIDDEN_SCALE = 2
const DISTORTION_AMOUNT = 0.5
const DISPERSION_AMOUNT = 5

const DEFAULT_PROPS = {
    radius: 2.8,
    rings: 3,
    ringGap: 1.6,
    tileHeight: 0.7,
    cornerRadius: 0.08,
    spinSpeed: 1,
    spinStagger: 0.2,
    wheel: true,
    wheelMultiplier: 3,
    revealDuration: 2,
    focusDuration: 1,
}

type TileProps = {
    texture: THREE.Texture
    angle: number
    radius: number
    isSelected: boolean
    ready: boolean
    onSelect: () => void
} & Pick<typeof DEFAULT_PROPS, "tileHeight" | "cornerRadius" | "revealDuration" | "focusDuration">

type RingProps = {
    radius: number
    count: number
    offset: number
    speed: number
    scale: number
    textures: THREE.Texture[]
    isSelected: boolean
    ready: boolean
    onSelect: (index: number) => void
    speedFactor: { current: number }
    revealBoost: { current: number }
} & Pick<typeof DEFAULT_PROPS, "tileHeight" | "cornerRadius" | "revealDuration" | "focusDuration">

type FocusTileProps = {
    texture: THREE.Texture | null
    cornerRadius: number
    focusDuration: number
    onDismiss: () => void
}

type OrbitSceneProps = {
    sources: string[]
    surface: RefObject<HTMLElement | null>
    activeIndex: number | null
    onSelect: (index: number) => void
    onDismiss: () => void
    onReady?: () => void
} & typeof DEFAULT_PROPS

type PlaneMesh<T extends THREE.Material> = THREE.Mesh<THREE.PlaneGeometry, T>

export type OrbitGalleryProps = {
    items: {
        src: string
        alt: string
    }[]
    className?: string
    onActiveChange?: (index: number | null) => void
    onReady?: () => void
} & Partial<typeof DEFAULT_PROPS> &
    Pick<WebglSceneProps, "mode" | "priority" | "zIndex" | "transparent">

declare module "@react-three/fiber" {
    interface ThreeElements {
        orbitTileMaterial: ThreeElement<typeof OrbitTileMaterial>
    }
}

/*
 * Shader material for each tile.
 * Draws the image, the rounded mask and the dispersion blur.
 */
const OrbitTileMaterial = shaderMaterial(
    {
        uMap: new THREE.Texture(),
        uTileSize: new THREE.Vector2(1, 1),
        uUvScale: new THREE.Vector2(1, 1),
        uUvOffset: new THREE.Vector2(0, 0),
        uRadius: 0,
        uOpacity: 1,
        uReveal: 1,
        uDistortion: 0,
        uDispersion: 0,
    },
    /* glsl */ `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    /* glsl */ `
        uniform sampler2D uMap;
        uniform vec2 uTileSize;
        uniform vec2 uUvScale;
        uniform vec2 uUvOffset;
        uniform float uRadius;
        uniform float uOpacity;
        uniform float uReveal;
        uniform float uDistortion;
        uniform float uDispersion;
        varying vec2 vUv;

        const int BLUR_SAMPLES = 16;
        const float RGB_SHIFT = 0.35;

        float sdRoundBox(vec2 point, vec2 halfSize, float radius) {
            vec2 corner = abs(point) - halfSize + radius;
            return min(max(corner.x, corner.y), 0.0) + length(max(corner, 0.0)) - radius;
        }

        vec4 sampleMap(vec2 uv) {
            return texture2D(uMap, uUvOffset + uv * uUvScale);
        }

        float roundBoxMask(vec2 uv) {
            vec2 point = (uv - 0.5) * uTileSize;
            vec2 halfSize = uTileSize * 0.5;
            float radius = min(uRadius, min(halfSize.x, halfSize.y));
            float boxDistance = sdRoundBox(point, halfSize, radius);
            float boxAntialias = fwidth(boxDistance);
            return smoothstep(boxAntialias, -boxAntialias, boxDistance);
        }

        void main() {
            vec2 centered = vUv - 0.5;
            vec2 uv = 0.5 + centered * (1.0 + uDistortion * (0.5 - dot(centered, centered)));

            vec4 texel = sampleMap(uv);
            vec3 color = texel.rgb;
            float alpha = texel.a;

            if (uDispersion > 0.0) {
                vec2 offset = uv - 0.5;
                float amount = uDispersion * dot(centered, centered);
                vec3 blurred = vec3(0.0);
                float total = 0.0;

                for (int sampleIndex = 0; sampleIndex < BLUR_SAMPLES; sampleIndex++) {
                    float progress = float(sampleIndex) / float(BLUR_SAMPLES - 1);
                    float weight = 1.0 - progress * 0.6;

                    float scale = 1.0 - amount * progress;
                    float spread = RGB_SHIFT * amount * progress;

                    blurred.r += sampleMap(0.5 + offset * (scale + spread)).r * weight;
                    blurred.g += sampleMap(0.5 + offset * scale).g * weight;
                    blurred.b += sampleMap(0.5 + offset * (scale - spread)).b * weight;

                    total += weight;
                }

                color = blurred / total;
            }

            float mask = roundBoxMask(uv);

            alpha *= mask;

            gl_FragColor = vec4(color, alpha * uOpacity * uReveal);
        }
    `,
)

extend({ OrbitTileMaterial })

/*
 * Image tile placed on a ring.
 * Handles the reveal, the fade and hover (opacity) transitions and click selection.
 */
function Tile({
    texture,
    angle,
    radius,
    tileHeight,
    cornerRadius,
    isSelected,
    ready,
    revealDuration,
    focusDuration,
    onSelect,
}: TileProps) {
    const [hovered, setHovered] = useState(false)
    const meshRef = useRef<PlaneMesh<InstanceType<typeof OrbitTileMaterial>>>(null)
    const wasSelected = useRef(isSelected)
    const width = tileHeight * TILE_ASPECT

    const crop = useMemo(() => {
        const image = texture.image as HTMLImageElement
        const imageAspect = image.width / image.height
        const scale =
            imageAspect > TILE_ASPECT
                ? new THREE.Vector2(TILE_ASPECT / imageAspect, 1)
                : new THREE.Vector2(1, imageAspect / TILE_ASPECT)
        return {
            scale,
            offset: new THREE.Vector2((1 - scale.x) / 2, (1 - scale.y) / 2),
        }
    }, [texture])

    const tilePlacement = useMemo(() => {
        return {
            position: new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0),
            rotation: angle - Math.PI / 2,
        }
    }, [angle, radius])

    useEffect(() => {
        function tileFadeAnimation() {
            const material = meshRef.current?.material
            if (!material) return
            const selectionChanged = wasSelected.current !== isSelected
            wasSelected.current = isSelected
            const controls = animate(
                material,
                { uOpacity: isSelected ? 0 : hovered ? 0.7 : 1 },
                selectionChanged
                    ? { duration: focusDuration * 0.3, ease: ANIMATION_EASING, delay: 0.2 }
                    : { duration: hovered ? 0.2 : 0.3 },
            )
            return () => controls.stop()
        }

        return tileFadeAnimation()
    }, [isSelected, hovered, focusDuration])

    useEffect(() => {
        if (!ready) return
        function tileRevealAnimation() {
            const material = meshRef.current?.material
            if (!material) return
            const controls = animate(
                material,
                { uReveal: 1 },
                { duration: revealDuration, ease: ANIMATION_EASING },
            )
            return () => controls.stop()
        }

        return tileRevealAnimation()
    }, [ready, revealDuration])

    return (
        <group position={tilePlacement.position} rotation-z={tilePlacement.rotation}>
            <mesh
                ref={meshRef}
                raycast={isSelected ? () => null : THREE.Mesh.prototype.raycast}
                onClick={(event) => {
                    event.stopPropagation()
                    onSelect()
                }}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
            >
                <planeGeometry args={[width, tileHeight]} />
                <orbitTileMaterial
                    key={OrbitTileMaterial.key}
                    uMap={texture}
                    uTileSize={new THREE.Vector2(width, tileHeight)}
                    uUvScale={crop.scale}
                    uUvOffset={crop.offset}
                    uRadius={cornerRadius}
                    uReveal={0}
                    transparent
                    depthWrite={false}
                />
            </mesh>
        </group>
    )
}

/*
 * One rotating ring of tiles.
 * Handles the spin and the fade-out when a tile is selected.
 */
function Ring({
    textures,
    radius,
    count,
    offset,
    speed,
    scale: ringScale,
    tileHeight,
    cornerRadius,
    isSelected,
    ready,
    revealDuration,
    focusDuration,
    onSelect,
    speedFactor,
    revealBoost,
}: RingProps) {
    const groupRef = useRef<THREE.Group>(null)
    const selectBoost = useRef(0)

    const tiles = useMemo(() => {
        return Array.from({ length: count }, (_, index) => {
            const textureIndex = (index + offset) % textures.length
            return {
                angle: (index / count) * TAU,
                textureIndex,
                texture: textures[textureIndex],
            }
        })
    }, [count, offset, textures])

    useEffect(() => {
        function ringFadeAnimation() {
            const group = groupRef.current
            if (!group) return
            const scale = isSelected ? ringScale : 1
            const controls = animate([
                [
                    group.scale,
                    { x: scale, y: scale, z: scale },
                    { duration: focusDuration * 0.8, ease: ANIMATION_EASING },
                ],
                [
                    selectBoost,
                    { current: isSelected ? SELECT_SPEED_BOOST : 1 },
                    { duration: focusDuration * 0.3, ease: "linear", at: 0 },
                ],
            ])
            return () => controls.stop()
        }

        return ringFadeAnimation()
    }, [isSelected, ringScale, focusDuration])

    useFrame((_, delta) => {
        const group = groupRef.current
        if (!group) return

        const boost = selectBoost.current + revealBoost.current
        const direction = Math.sign(speed)
        const rmp = (speed + direction * boost) * speedFactor.current
        group.rotation.z += (rmp * TAU * delta) / 60
    })

    return (
        <group ref={groupRef}>
            {tiles.map((tile, index) => (
                <Tile
                    key={index}
                    texture={tile.texture}
                    angle={tile.angle}
                    radius={radius}
                    tileHeight={tileHeight}
                    cornerRadius={cornerRadius}
                    isSelected={isSelected}
                    ready={ready}
                    revealDuration={revealDuration}
                    focusDuration={focusDuration}
                    onSelect={() => onSelect(tile.textureIndex)}
                />
            ))}
        </group>
    )
}

/*
 * Enlarged tile shown when an image is selected.
 * Handles the zoom, distortion and fade transitions.
 */
function FocusTile({ texture, cornerRadius, focusDuration, onDismiss }: FocusTileProps) {
    const [displayed, setDisplayed] = useState<THREE.Texture | null>(null)
    const meshRef = useRef<PlaneMesh<InstanceType<typeof OrbitTileMaterial>>>(null)

    useEffect(() => {
        if (texture) setDisplayed(texture)
    }, [texture])

    useEffect(() => {
        function focusTileFadeAnimation() {
            const mesh = meshRef.current
            if (!mesh) return
            const scale = texture ? 1 : FOCUS_TILE_HIDDEN_SCALE
            const controls = animate([
                [
                    mesh.material,
                    { uOpacity: texture ? 1 : 0 },
                    { duration: focusDuration * 0.8, ease: ANIMATION_EASING },
                ],
                [
                    mesh.material,
                    { uDistortion: texture ? 0 : DISTORTION_AMOUNT },
                    { duration: focusDuration * 0.8, ease: ANIMATION_EASING, at: 0 },
                ],
                [
                    mesh.material,
                    { uDispersion: texture ? 0 : DISPERSION_AMOUNT },
                    { duration: focusDuration * 0.8, ease: ANIMATION_EASING, at: 0 },
                ],
                [
                    mesh.scale,
                    { x: scale, y: scale },
                    { duration: focusDuration * 0.7, ease: ANIMATION_EASING, at: 0 },
                ],
            ])
            if (!texture) controls.then(() => setDisplayed(null))
            return () => controls.stop()
        }

        return focusTileFadeAnimation()
    }, [texture, displayed, focusDuration])

    if (!displayed) return null

    const image = displayed.image as HTMLImageElement
    const width = FOCUS_TILE_SIZE * (image.width / image.height)

    return (
        <mesh
            ref={meshRef}
            position-z={1}
            scale={[FOCUS_TILE_HIDDEN_SCALE, FOCUS_TILE_HIDDEN_SCALE, 1]}
            raycast={texture ? THREE.Mesh.prototype.raycast : () => null}
            onPointerOver={(event) => event.stopPropagation()}
            onClick={(event) => {
                event.stopPropagation()
                onDismiss()
            }}
        >
            <planeGeometry args={[width, FOCUS_TILE_SIZE]} />
            <orbitTileMaterial
                key={OrbitTileMaterial.key}
                uMap={displayed}
                uTileSize={new THREE.Vector2(width, FOCUS_TILE_SIZE)}
                uRadius={cornerRadius}
                uOpacity={0}
                uDistortion={DISTORTION_AMOUNT}
                uDispersion={DISPERSION_AMOUNT}
                transparent
                depthWrite={false}
            />
        </mesh>
    )
}

/*
 * Builds the ring configs and loads the textures.
 * Tracks the selected tile and handles dismissal.
 */
function OrbitScene({
    sources,
    surface,
    activeIndex,
    onSelect,
    onDismiss,
    radius,
    rings,
    ringGap,
    tileHeight,
    cornerRadius,
    spinSpeed,
    spinStagger,
    wheel,
    wheelMultiplier,
    revealDuration,
    focusDuration,
    onReady,
}: OrbitSceneProps) {
    const textures = useTexture(sources)
    const speedFactor = useRef(1)
    const revealBoost = useRef(REVEAL_SPEED_BOOST)
    const ready = useWebglReady({ onReady })
    const selected = activeIndex !== null ? textures[activeIndex] : null

    const select = useCallback(
        (index: number) => {
            onSelect(index)
            surface.current?.style.removeProperty("cursor")
        },
        [onSelect, surface],
    )

    useEffect(() => {
        if (!ready) return
        function revealSpinAnimation() {
            const controls = animate(
                revealBoost,
                { current: 0 },
                { duration: revealDuration, ease: ANIMATION_EASING },
            )
            return () => controls.stop()
        }

        return revealSpinAnimation()
    }, [ready, revealDuration])

    useEffect(() => {
        const target = surface.current
        if (!target || !wheel) return

        const onWheel = (event: WheelEvent) => {
            event.preventDefault()
            speedFactor.current += event.deltaY * 0.01 * wheelMultiplier
        }
        target.addEventListener("wheel", onWheel)
        return () => target.removeEventListener("wheel", onWheel)
    }, [surface, wheel, wheelMultiplier])

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onDismiss()
        }
        window.addEventListener("keydown", onKeyDown)
        return () => window.removeEventListener("keydown", onKeyDown)
    }, [onDismiss])

    useFrame((_, delta) => {
        speedFactor.current = THREE.MathUtils.damp(
            speedFactor.current,
            Math.sign(speedFactor.current) || 1,
            8,
            delta,
        )
    })

    const ringConfigs = useMemo(
        () =>
            Array.from({ length: rings }, (_, ring) => {
                const ringRadius = radius + ring * ringGap

                return {
                    radius: ringRadius,
                    count: Math.max(3, Math.round(sources.length * (ringRadius / radius))),
                    offset: Math.round((ring * sources.length) / rings),
                    speed: spinSpeed * spinStagger ** ring,
                    scale: 1 - RING_DOWNSCALE / (ring + 1),
                }
            }),
        [radius, rings, ringGap, sources.length, spinSpeed, spinStagger],
    )

    return (
        <group
            onPointerMissed={onDismiss}
            onPointerOver={() => surface.current?.style.setProperty("cursor", "pointer")}
            onPointerOut={() => surface.current?.style.removeProperty("cursor")}
        >
            {ringConfigs.map((config, index) => (
                <Ring
                    key={index}
                    textures={textures}
                    radius={config.radius}
                    count={config.count}
                    offset={config.offset}
                    speed={config.speed}
                    scale={config.scale}
                    tileHeight={tileHeight}
                    cornerRadius={cornerRadius}
                    isSelected={selected !== null}
                    ready={ready}
                    revealDuration={revealDuration}
                    focusDuration={focusDuration}
                    onSelect={select}
                    speedFactor={speedFactor}
                    revealBoost={revealBoost}
                />
            ))}

            <FocusTile
                texture={selected}
                cornerRadius={cornerRadius}
                focusDuration={focusDuration}
                onDismiss={onDismiss}
            />
        </group>
    )
}

/*
 * Public component for the gallery.
 * Takes the images and renders the WebGL scene.
 */
export function OrbitGallery({
    items,
    className,
    onActiveChange,
    mode,
    priority,
    zIndex,
    transparent,
    ...rest
}: OrbitGalleryProps) {
    const surface = useRef<ComponentRef<"div">>(null)
    const sceneProps = { ...DEFAULT_PROPS, ...rest }
    const [activeIndex, setActiveIndex] = useState<number | null>(null)

    const dismiss = useCallback(() => {
        setActiveIndex(null)
    }, [])

    useEffect(() => {
        onActiveChange?.(activeIndex)
    }, [activeIndex, onActiveChange])

    return (
        <div ref={surface} className={`touch-none select-none ${className ?? ""}`}>
            {/* Basic SEO/accessibility layer */}
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
                >
                    <OrbitScene
                        {...sceneProps}
                        surface={surface}
                        sources={items.map((image) => image.src)}
                        activeIndex={activeIndex}
                        onSelect={setActiveIndex}
                        onDismiss={dismiss}
                    />
                </WebglScene>
            )}
        </div>
    )
}
