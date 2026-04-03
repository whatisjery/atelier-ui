import { useFBO, useTexture } from "@react-three/drei"
import { createPortal, useFrame, useThree } from "@react-three/fiber"
import { useCallback, useEffect, useMemo, useRef } from "react"
import type { Group, Mesh, Texture } from "three"
import {
    AdditiveBlending,
    HalfFloatType,
    LinearFilter,
    MathUtils,
    MeshBasicMaterial,
    OrthographicCamera,
    Scene,
} from "three"
import ripple from "../../assets/ripple.png"

const ROTATION_SPEED = 0.1 as const
const INITIAL_OPACITY = 0.22 as const
const DISPLACEMENT_DAMPING = 6.3 as const
const VELOCITY_DAMPING = 6.3 as const
const MIN_VELOCITY = 0 as const

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

type LiquidTouchMaterialProps = {
    map: Texture
    rippleMap?: Texture
    intensity?: number
    radius?: number
    expandRate?: number
    decayRate?: number
    maxRipples?: number
}

type Uniforms = {
    uTexture: { value: Texture | null }
    uDisplacement: { value: Texture | null }
    uDisplacementIntensity: { value: number }
}

export function LiquidTouchMaterial({
    map,
    rippleMap,
    intensity = 0.14,
    radius = 3,
    expandRate = 7,
    decayRate = 3,
    maxRipples = 50,
}: LiquidTouchMaterialProps) {
    const { viewport, size, gl } = useThree()

    const defaultBrush = useTexture(typeof ripple === "string" ? ripple : ripple.src)
    const brush = rippleMap ?? defaultBrush
    const anchorRef = useRef<Group>(null)
    const prevMouse = useRef({ x: 0, y: 0, velocity: 0 })
    const splatIndex = useRef(0)
    const spriteRefs = useRef<Mesh[]>([])
    const displacementSmoothed = useRef(0)
    const spriteScene = useMemo(() => new Scene(), [])
    const spriteCamera = useMemo(() => new OrthographicCamera(-1, 1, 1, -1, 0, 1), [])

    const uniforms = useMemo<Uniforms>(
        () => ({
            uTexture: { value: null },
            uDisplacement: { value: null },
            uDisplacementIntensity: { value: 0 },
        }),
        [],
    )

    const FBO = useFBO(size.width, size.height, {
        minFilter: LinearFilter,
        magFilter: LinearFilter,
        type: HalfFloatType,
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

    useFrame((state, delta) => {
        const parent = anchorRef.current?.parent as Mesh | null

        if (!parent) return

        const sprites = spriteRefs.current
        const pointerX = (state.pointer.x * viewport.width) / 2
        const pointerY = (state.pointer.y * viewport.height) / 2
        const dx = pointerX - prevMouse.current.x
        const dy = pointerY - prevMouse.current.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        prevMouse.current.x = pointerX
        prevMouse.current.y = pointerY

        state.raycaster.setFromCamera(state.pointer, state.camera)
        const hovering = state.raycaster.intersectObject(parent).length > 0

        if (hovering) {
            prevMouse.current.velocity = Math.max(
                MIN_VELOCITY,
                MathUtils.damp(prevMouse.current.velocity, dist, VELOCITY_DAMPING, delta),
            )
        }

        if (hovering && dist > 0.001) {
            const idx = splatIndex.current % maxRipples
            const sprite = sprites[idx]

            if (sprite.material instanceof MeshBasicMaterial) {
                const scale = radius / Math.min(viewport.width, viewport.height)
                sprite.visible = true
                sprite.position.set(pointerX, pointerY, 0)
                sprite.scale.set(scale, scale, 1)
                sprite.material.opacity = INITIAL_OPACITY
            }
            splatIndex.current = (splatIndex.current + 1) % maxRipples
        }

        for (const sprite of sprites) {
            if (sprite.material instanceof MeshBasicMaterial) {
                sprite.rotation.z += 2 * delta * ROTATION_SPEED
                sprite.material.opacity = MathUtils.damp(
                    sprite.material.opacity,
                    0,
                    decayRate,
                    delta,
                )
                sprite.scale.x += delta * expandRate
                sprite.scale.y = sprite.scale.x
            }
        }

        gl.setRenderTarget(FBO)
        gl.render(spriteScene, spriteCamera)
        gl.setRenderTarget(null)

        uniforms.uDisplacement.value = FBO.texture

        displacementSmoothed.current = MathUtils.damp(
            displacementSmoothed.current,
            intensity * prevMouse.current.velocity * 5,
            DISPLACEMENT_DAMPING,
            delta,
        )
        uniforms.uDisplacementIntensity.value = displacementSmoothed.current
    })

    const setSprite = useCallback((el: Mesh | null, i: number) => {
        if (!el) return
        spriteRefs.current[i] = el
    }, [])

    const portal = useMemo(
        () =>
            createPortal(
                <group>
                    {Array.from({ length: maxRipples }, (_, i) => (
                        <mesh
                            key={i}
                            ref={(el) => setSprite(el, i)}
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
        [maxRipples, brush, spriteScene, setSprite],
    )

    return (
        <>
            <group ref={anchorRef} />

            <shaderMaterial
                attach="material"
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
            />

            {portal}
        </>
    )
}
