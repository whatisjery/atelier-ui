import { useFBO, useTexture } from "@react-three/drei"
import { createPortal, useFrame, useThree } from "@react-three/fiber"
import { useEffect, useMemo, useRef } from "react"
import type { Group, Mesh, MeshBasicMaterial, PlaneGeometry, ShaderMaterial, Texture } from "three"
import { AdditiveBlending, LinearFilter, MathUtils, OrthographicCamera, Scene } from "three"
import { type Pointer, WebglImage } from "../webgl-image/webgl-image"
import { WebglVideo } from "../webgl-video/webgl-video"

const ROTATION_SPEED = 0.1
const INITIAL_OPACITY = 0.22
const DISPLACEMENT_DAMPING = 6.3
const VELOCITY_DAMPING = 6.3
const IDLE_VELOCITY_DAMPING = 0.3
const SPAWN_SPACING = 0.2
const MIN_SPAWN_INTERVAL = 1 / 60
const MIN_SPAWN_DISTANCE = 0.005
const MIN_VISIBLE_OPACITY = 0.002

type Splat = Mesh<PlaneGeometry, MeshBasicMaterial>

const RIPPLE_BRUSH =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAAAnFBMVEUAAAD////////////////////////////////////////////////////+/v7////9/f3////9/f39/f3////////////9/f3+/v79/f3////////+/v79/f3+/v7////////+/v7////+/v7////+/v7+/v7////////////+/v7////+/v7+/v7+/v7+/v7////////////////Clg1EAAAANHRSTlMACAwRBBUcICQZKDM4LEAwSjxGTml2XEOCUmRhh1eLcXpUbpl+Wo+1kqumsJafnKK+ucPKHu8hDAAADa9JREFUeNrslcl6olAUhJOWCCKDgDJeJkEEFBzy/u/Wda7na9PboK6sRRbJon7qVN18vPXWW2/9UspNH68Wm3/e9XoIcv9zFzG8EkJRyH42m31BM4gYXgjB9l+LxVxqISkY4gUM5I9vn6uqpum6rmmqCghmeAGC/HzYa7ppL0m2aeqaykGA4ZkI/PmzxVzT7aVhWUEQWJZjAAIMKjM8sZMc/0LVzaUTuJ4XRZHnrdzAMgwwAAIMHANTPMOfPt+wXC/1kySOE39XRh4zSAQeBpfysfbsv3Rcr/TjbU7arteJn0bIgW7BdfgxT+Wx54e/Cf9oF283RR1CdbEBRLJLcQvrXx1AwY14FMInn1/6l/46L0LRNG3bNFkYgmEdyxhwCbkLnucNQXnQ+rh+FvlvatFU4zgM41gdGxHWhJDsZBscAxTLWxZAeAiBwuvXTcNalcl6E2bH8dR3UH8axqrNgLBFCrvSW61cl/dpm5q6YIKp/jOuP/x96T/03WEPHQ5gGCmFAghIYZemZVqWkeyErTPBg+bH/jX5H/aXy/l8uYCh6zkE2sQ6juWPxC+9wFkSwWSA//3zWrRj35E/BAQQUAYZLeKmoqBtxH7kWiD4mkiAAPD8qtI/8mP0vzkOHQI4XyEQUAQDIhAYZU3bFBkk0IokXTm2PieCCQB8AOq/R/sPRVv1EuB88+cbNEQghGjaIwYyHltR53HpGrY27QgKv/94/j0MIC9oAQTwswOD9CdlbTXQPuh3WZ0nUWDQEfAeTQ3AsPgBDMlDEtxXQAcQMvxG9nNPXH2VFVt/5XAEEwOwjQANlAAwGQf6SJh3PduHNZpX42/Vqduf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"

const vertexShader = /* glsl */ `
varying vec2 vUv;
varying vec2 vScreenUv;

void main() {
    vUv = uv;
    vec4 pos = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vScreenUv = pos.xy / pos.w * 0.5 + 0.5;
    gl_Position = pos;
}`

const fragmentShader = /* glsl */ `
precision highp float;
uniform sampler2D uTexture;
uniform sampler2D uDisplacement;
uniform float uDisplacementIntensity;
varying vec2 vUv;
varying vec2 vScreenUv;

#define PI 3.14159265

void main() {
    vec4 displacement = texture2D(uDisplacement, vScreenUv);
    float theta = displacement.r * 2.0 * PI;
    vec2 direction = vec2(sin(theta), cos(theta));
    vec2 displacedUv = vUv + direction * displacement.r * uDisplacementIntensity;
    vec4 color = texture2D(uTexture, displacedUv);
    gl_FragColor = color;
}`

type LiquidMediaMaterialProps = {
    map: Texture
    pointer: Pointer
} & Pick<LiquidEffectProps, "rippleMap" | "intensity" | "radius" | "expandRate" | "decayRate">

type Uniforms = {
    uTexture: { value: Texture | null }
    uDisplacement: { value: Texture | null }
    uDisplacementIntensity: { value: number }
}

export type LiquidEffectProps = {
    rippleMap?: Texture
    intensity?: number
    radius?: number
    expandRate?: number
    decayRate?: number
    segments?: number
    webglEnabled?: boolean
}

type LiquidMediaImageProps = LiquidEffectProps & {
    type?: "image"
    src: string
    alt: string
} & Omit<React.ComponentPropsWithoutRef<"img">, "src" | "alt">

type LiquidMediaVideoProps = LiquidEffectProps & {
    type: "video"
    src: string
} & Omit<React.ComponentPropsWithoutRef<"video">, "src">

export type LiquidMediaProps = LiquidMediaImageProps | LiquidMediaVideoProps

function LiquidMediaMaterial({
    map,
    pointer,
    rippleMap,
    intensity = 0.2,
    radius = 12,
    expandRate = 11,
    decayRate = 3,
}: LiquidMediaMaterialProps) {
    const { viewport, size, gl } = useThree()

    const defaultBrush = useTexture(RIPPLE_BRUSH)
    const brush = rippleMap ?? defaultBrush
    const anchorRef = useRef<Group>(null)
    const splatIndex = useRef(0)
    const spriteRefs = useRef<Splat[]>([])
    const spriteScene = useMemo(() => new Scene(), [])
    const spriteCamera = useMemo(() => new OrthographicCamera(-1, 1, 1, -1, 0, 1), [])
    const materialRef = useRef<ShaderMaterial>(null)
    const mouse = useRef({
        x: 0,
        y: 0,
        velocity: 0,
        spawnX: Infinity,
        spawnY: Infinity,
        spawnElapsed: Infinity,
    })

    const uniforms = useMemo<Uniforms>(
        () => ({
            uTexture: { value: map },
            uDisplacement: { value: null },
            uDisplacementIntensity: { value: 0 },
        }),
        [map],
    )

    const FBO = useFBO(size.width, size.height, {
        minFilter: LinearFilter,
        magFilter: LinearFilter,
    })

    useEffect(() => {
        uniforms.uTexture.value = map
    }, [map, uniforms])

    useEffect(() => {
        spriteCamera.left = -viewport.width / 2
        spriteCamera.right = viewport.width / 2
        spriteCamera.top = viewport.height / 2
        spriteCamera.bottom = -viewport.height / 2
        spriteCamera.updateProjectionMatrix()
    }, [viewport, spriteCamera])

    useFrame((_, delta) => {
        const parent = anchorRef.current?.parent as Mesh | null
        const mat = materialRef.current
        if (!parent || !mat || delta <= 0) return

        const sprites = spriteRefs.current
        const _mouse = mouse.current
        const hovering = pointer.hover > 0.5

        const pointerX = parent.position.x + (pointer.uv.x - 0.5) * parent.scale.x
        const pointerY = parent.position.y + (pointer.uv.y - 0.5) * parent.scale.y

        const dx = pointerX - _mouse.x
        const dy = pointerY - _mouse.y

        // Normalized to 60Hz so speed remains identical on every display.
        const speed = Math.sqrt(dx * dx + dy * dy) / (delta * 60)

        _mouse.x = pointerX
        _mouse.y = pointerY

        if (hovering) {
            _mouse.velocity = MathUtils.damp(_mouse.velocity, speed, VELOCITY_DAMPING, delta)
        } else {
            _mouse.velocity = MathUtils.damp(_mouse.velocity, 0, IDLE_VELOCITY_DAMPING, delta)
        }

        const scale = (radius * Math.min(viewport.width, viewport.height)) / 100
        const spacing = Math.max(scale * SPAWN_SPACING, MIN_SPAWN_DISTANCE)
        const spawnDx = pointerX - _mouse.spawnX
        const spawnDy = pointerY - _mouse.spawnY
        const spawnDist = Math.sqrt(spawnDx * spawnDx + spawnDy * spawnDy)

        _mouse.spawnElapsed += delta

        if (hovering && spawnDist > spacing && _mouse.spawnElapsed > MIN_SPAWN_INTERVAL) {
            const sprite = sprites[splatIndex.current]

            if (sprite) {
                sprite.visible = true
                sprite.position.set(pointerX, pointerY, 0)
                sprite.scale.set(scale, scale, 1)
                sprite.material.opacity = INITIAL_OPACITY
            }

            splatIndex.current = (splatIndex.current + 1) % 100
            _mouse.spawnX = pointerX
            _mouse.spawnY = pointerY
            _mouse.spawnElapsed = 0
        }

        for (const sprite of sprites) {
            if (sprite.visible) {
                sprite.rotation.z += 2 * delta * ROTATION_SPEED
                sprite.material.opacity = MathUtils.damp(
                    sprite.material.opacity,
                    0,
                    MathUtils.clamp(decayRate, 3, 10),
                    delta,
                )
                sprite.scale.x += delta * expandRate * scale
                sprite.scale.y = sprite.scale.x
                if (sprite.material.opacity < MIN_VISIBLE_OPACITY) sprite.visible = false
            }
        }

        gl.setRenderTarget(FBO)
        gl.render(spriteScene, spriteCamera)
        gl.setRenderTarget(null)

        mat.uniforms.uDisplacement.value = FBO.texture
        mat.uniforms.uDisplacementIntensity.value = MathUtils.damp(
            mat.uniforms.uDisplacementIntensity.value,
            intensity * _mouse.velocity * 5,
            DISPLACEMENT_DAMPING,
            delta,
        )
    })

    const portal = useMemo(
        () =>
            createPortal(
                <group>
                    {Array.from({ length: 100 }, (_, i) => (
                        <mesh
                            key={i}
                            ref={(mesh) => {
                                if (mesh) spriteRefs.current[i] = mesh as Splat
                            }}
                            visible={false}
                            rotation-z={Math.random() * Math.PI * 2}
                        >
                            <planeGeometry args={[1, 1]} />
                            <meshBasicMaterial
                                map={brush}
                                transparent
                                blending={AdditiveBlending}
                                depthTest={false}
                                depthWrite={false}
                            />
                        </mesh>
                    ))}
                </group>,
                spriteScene,
            ),
        [brush, spriteScene],
    )

    return (
        <>
            <group ref={anchorRef} />

            <shaderMaterial
                ref={materialRef}
                attach="material"
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
            />

            {portal}
        </>
    )
}

export function LiquidMedia(props: LiquidMediaProps) {
    const { rippleMap, intensity, radius, expandRate, decayRate, segments, webglEnabled, ...rest } =
        props

    const material = (map: Texture, pointer: Pointer) => (
        <LiquidMediaMaterial
            map={map}
            pointer={pointer}
            rippleMap={rippleMap}
            intensity={intensity}
            radius={radius}
            expandRate={expandRate}
            decayRate={decayRate}
        />
    )

    if (rest.type === "video") {
        const { type: _type, ...videoProps } = rest
        return (
            <WebglVideo
                segments={segments}
                webglEnabled={webglEnabled}
                material={material}
                {...videoProps}
            />
        )
    }

    const { type: _type, ...imageProps } = rest
    return (
        <WebglImage
            segments={segments}
            webglEnabled={webglEnabled}
            material={material}
            {...imageProps}
        />
    )
}
