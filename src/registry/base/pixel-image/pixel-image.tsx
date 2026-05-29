import { shaderMaterial } from "@react-three/drei"
import { extend, type ThreeElement, useFrame } from "@react-three/fiber"
import { useMemo, useRef } from "react"
import { DataTexture, FloatType, NearestFilter, RGBAFormat, Texture, Vector2 } from "three"
import { type Pointer, WebglImage } from "../webgl-image/webgl-image"

declare module "@react-three/fiber" {
    interface ThreeElements {
        pixelImageMat: ThreeElement<typeof PixelImageMat>
    }
}

const vertexShader = /* glsl */ `
    precision highp float;
    varying vec2 vUv;

    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`

const fragmentShader = /* glsl */ `
    precision highp float;
    varying vec2 vUv;

    uniform sampler2D uMap;
    uniform sampler2D uGrid;
    uniform float uStrength;
    uniform float uAberration;

    void main() {
        vec2 offset = texture2D(uGrid, vUv).rg * uStrength;
        vec2 uv = vUv - offset;
        vec2 shift = offset * uAberration;

        gl_FragColor = vec4(
            texture2D(uMap, uv - shift).r,
            texture2D(uMap, uv).g,
            texture2D(uMap, uv + shift).b,
            1.0
        );
    }
`

const PixelImageMat = shaderMaterial(
    {
        uMap: new Texture(),
        uGrid: new Texture(),
        uStrength: 0.5,
        uAberration: 0.5,
    },
    vertexShader,
    fragmentShader,
)

extend({ PixelImageMat })

const REFERENCE_FPS = 60

type PixelImageMaterialProps = {
    map: Texture
    pointer: Pointer
    gridSize: number
    interactionRadius: number
    strength: number
    aberration: number
    trail: number
}

export type PixelImageProps = {
    src: string
    alt: string
    gridSize?: number
    interactionRadius?: number
    strength?: number
    aberration?: number
    trail?: number
    segments?: number
    webglEnabled?: boolean
} & Omit<React.ComponentPropsWithoutRef<"img">, "src" | "alt">

function PixelImageMaterial({
    map,
    pointer,
    gridSize,
    interactionRadius,
    strength,
    aberration,
    trail,
}: PixelImageMaterialProps) {
    const ref = useRef<InstanceType<typeof PixelImageMat>>(null)
    const previous = useMemo(() => new Vector2(0.5, 0.5), [])

    const grid = useMemo(() => {
        const data = new Float32Array(gridSize * gridSize * 4)
        const texture = new DataTexture(data, gridSize, gridSize, RGBAFormat, FloatType)
        texture.magFilter = NearestFilter
        texture.minFilter = NearestFilter
        texture.needsUpdate = true
        return { texture, data }
    }, [gridSize])

    useFrame((_, delta) => {
        const material = ref.current
        if (!material) return

        const { data } = grid
        const velocityX = (pointer.uv.x - previous.x) * pointer.hover
        const velocityY = (pointer.uv.y - previous.y) * pointer.hover
        previous.copy(pointer.uv)

        const fade = trail ** (delta * REFERENCE_FPS)
        const cursorColumn = pointer.uv.x * gridSize
        const cursorRow = pointer.uv.y * gridSize

        for (let row = 0; row < gridSize; row++) {
            for (let column = 0; column < gridSize; column++) {
                const index = (row * gridSize + column) * 4
                const distance = Math.hypot(column - cursorColumn, row - cursorRow)
                const falloff = Math.max(0, 1 - distance / interactionRadius)
                data[index] = data[index] * fade + velocityX * falloff
                data[index + 1] = data[index + 1] * fade + velocityY * falloff
            }
        }

        grid.texture.needsUpdate = true
        material.uMap = map
        material.uGrid = grid.texture
        material.uStrength = strength
        material.uAberration = aberration
    })

    return (
        <pixelImageMat
            ref={ref}
            key={PixelImageMat.key}
            uMap={map}
            uGrid={grid.texture}
            transparent
        />
    )
}

export function PixelImage({
    src,
    alt,
    gridSize = 22,
    interactionRadius = 4,
    strength = 1.65,
    aberration = 0.25,
    trail = 0.93,
    segments = 1,
    webglEnabled = true,
    ...rest
}: PixelImageProps) {
    return (
        <WebglImage
            src={src}
            alt={alt}
            segments={segments}
            webglEnabled={webglEnabled}
            material={(map, pointer) => (
                <PixelImageMaterial
                    map={map}
                    pointer={pointer}
                    gridSize={gridSize}
                    interactionRadius={interactionRadius}
                    strength={strength}
                    aberration={aberration}
                    trail={trail}
                />
            )}
            {...rest}
        />
    )
}
