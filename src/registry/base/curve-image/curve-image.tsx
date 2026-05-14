import { shaderMaterial } from "@react-three/drei"
import { extend, type ThreeElement, useFrame } from "@react-three/fiber"
import { useEffect, useRef } from "react"
import { MathUtils, Texture } from "three"
import { WebglImage } from "../webgl-image/webgl-image"

declare module "@react-three/fiber" {
    interface ThreeElements {
        curveImageMat: ThreeElement<typeof CurveImageMat>
    }
}

const vertexShader = /* glsl */ `
    precision highp float;
    varying vec2 vUv;
    uniform float uVelocity;
    uniform float uAmplitude;

    const float PI = 3.14159265;

    void main() {
        vUv = uv;
        vec3 pos = position;

        float bend = sin(uv.x * PI);

        pos.y += bend * uVelocity * uAmplitude;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
`

const fragmentShader = /* glsl */ `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D uMap;
    uniform float uVelocity;
    uniform float uAberration;

    void main() {
        float shift = uVelocity * uAberration;
        vec2 offset = vec2(0.0, shift);

        float r = texture2D(uMap, vUv + offset).r;
        float g = texture2D(uMap, vUv).g;
        float b = texture2D(uMap, vUv - offset).b;

        gl_FragColor = vec4(r, g, b, 1.0);
    }
`

const CurveImageMat = shaderMaterial(
    {
        uMap: new Texture(),
        uVelocity: 0,
        uAmplitude: 0,
        uAberration: 0,
    },
    vertexShader,
    fragmentShader,
)

extend({ CurveImageMat })

type CurveImageMaterialProps = {
    map: Texture
    amplitude: number
    aberration: number
    smoothing: number
}

export type CurveImageProps = {
    src: string
    alt: string
    amplitude?: number
    aberration?: number
    smoothing?: number
    segments?: number
    webglEnabled?: boolean
} & Omit<React.ComponentPropsWithoutRef<"img">, "src" | "alt">

function CurveImageMaterial({ map, amplitude, aberration, smoothing }: CurveImageMaterialProps) {
    const ref = useRef<InstanceType<typeof CurveImageMat>>(null)
    const lastScrollY = useRef(0)
    const velocity = useRef(0)

    useEffect(() => {
        lastScrollY.current = window.scrollY
    }, [])

    useFrame((_, delta) => {
        const mat = ref.current
        if (!mat) return
        const current = window.scrollY
        const instantDelta = current - lastScrollY.current
        lastScrollY.current = current

        if (delta === 0) return
        const target = instantDelta / delta / window.innerHeight
        velocity.current = MathUtils.damp(velocity.current, target, smoothing, delta)
        mat.uVelocity = velocity.current
    })

    return (
        <curveImageMat
            ref={ref}
            key={CurveImageMat.key}
            uMap={map}
            uAmplitude={amplitude}
            uAberration={aberration}
            transparent
        />
    )
}

export function CurveImage({
    src,
    alt,
    amplitude = 0.03,
    aberration = 0.003,
    smoothing = 6,
    segments = 32,
    webglEnabled = true,
    ...rest
}: CurveImageProps) {
    return (
        <WebglImage src={src} alt={alt} segments={segments} webglEnabled={webglEnabled} {...rest}>
            {(map) => (
                <CurveImageMaterial
                    map={map}
                    amplitude={amplitude}
                    aberration={aberration}
                    smoothing={smoothing}
                />
            )}
        </WebglImage>
    )
}
