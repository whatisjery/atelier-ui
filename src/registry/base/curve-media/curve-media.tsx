import { shaderMaterial } from "@react-three/drei"
import { extend, type ThreeElement, useFrame } from "@react-three/fiber"
import { useEffect, useRef } from "react"
import { MathUtils, Texture } from "three"
import { WebglImage } from "../webgl-image/webgl-image"
import { WebglVideo } from "../webgl-video/webgl-video"

declare module "@react-three/fiber" {
    interface ThreeElements {
        curveMediaMat: ThreeElement<typeof CurveMediaMat>
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

const CurveMediaMat = shaderMaterial(
    {
        uMap: new Texture(),
        uVelocity: 0,
        uAmplitude: 0,
        uAberration: 0,
    },
    vertexShader,
    fragmentShader,
)

extend({ CurveMediaMat })

export type CurveEffectProps = {
    amplitude?: number
    aberration?: number
    smoothing?: number
    segments?: number
    webglEnabled?: boolean
}

type CurveMediaMaterialProps = {
    map: Texture
} & Required<Pick<CurveEffectProps, "amplitude" | "aberration" | "smoothing">>

type CurveMediaImageProps = CurveEffectProps & {
    type?: "image"
    src: string
    alt: string
} & Omit<React.ComponentPropsWithoutRef<"img">, "src" | "alt">

type CurveMediaVideoProps = CurveEffectProps & {
    type: "video"
    src: string
} & Omit<React.ComponentPropsWithoutRef<"video">, "src">

export type CurveMediaProps = CurveMediaImageProps | CurveMediaVideoProps

function CurveMediaMaterial({ map, amplitude, aberration, smoothing }: CurveMediaMaterialProps) {
    const ref = useRef<InstanceType<typeof CurveMediaMat>>(null)
    const lastScrollY = useRef(0)
    const velocity = useRef(0)

    useEffect(() => {
        lastScrollY.current = window.scrollY
    }, [])

    useFrame((_, delta) => {
        const material = ref.current
        if (!material) return
        const current = window.scrollY
        const instantDelta = current - lastScrollY.current
        lastScrollY.current = current

        if (delta === 0) return
        const target = instantDelta / delta / window.innerHeight
        velocity.current = MathUtils.damp(velocity.current, target, smoothing, delta)
        material.uVelocity = velocity.current
    })

    return (
        <curveMediaMat
            ref={ref}
            key={CurveMediaMat.key}
            uMap={map}
            uAmplitude={amplitude}
            uAberration={aberration}
            transparent
        />
    )
}

export function CurveMedia(props: CurveMediaProps) {
    const {
        amplitude = 0.03,
        aberration = 0.003,
        smoothing = 6,
        segments = 32,
        webglEnabled = true,
        ...rest
    } = props

    // Scroll-velocity is read from the window each frame, so the same material
    // runs on both the image and video primitives (they share the WebGL plane contract).
    const material = (map: Texture) => (
        <CurveMediaMaterial
            map={map}
            amplitude={amplitude}
            aberration={aberration}
            smoothing={smoothing}
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
