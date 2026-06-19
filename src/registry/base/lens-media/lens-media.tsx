import { shaderMaterial } from "@react-three/drei"
import { extend, type ThreeElement, useFrame } from "@react-three/fiber"
import { useRef } from "react"
import { type Group, MathUtils, Texture, Vector2 } from "three"
import { type Pointer, WebglImage } from "../webgl-image/webgl-image"
import { WebglVideo } from "../webgl-video/webgl-video"

declare module "@react-three/fiber" {
    interface ThreeElements {
        lensMediaMat: ThreeElement<typeof LensMediaMat>
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
    #define MAX_DISPERSION 64
    varying vec2 vUv;

    uniform sampler2D uMap;
    uniform vec2 uMouse;
    uniform float uAspect;
    uniform float uSize;
    uniform float uSoftness;
    uniform float uAberration;
    uniform float uRefraction;
    uniform float uHover;
    uniform int uDispersion;

    void main() {
        vec2 toCenter = vUv - uMouse;

        vec2 aspectDistance = vec2(toCenter.x * uAspect, toCenter.y);
        float radius = length(aspectDistance);
        float mask = (1.0 - smoothstep(uSize, uSize + uSoftness, radius)) * uHover;

        vec2 refracted = vUv - toCenter * uRefraction * mask;

        vec2 shift = toCenter * uAberration * mask;
        vec3 color = vec3(0.0);
        vec3 total = vec3(0.0);

        for (int i = 0; i < MAX_DISPERSION; i++) {
            if (i >= uDispersion) break;
            float t = (float(i) + 0.5) / float(uDispersion);
            vec3 weight = clamp(1.0 - 2.0 * abs(t - vec3(0.0, 0.5, 1.0)), 0.0, 1.0);
            color += texture2D(uMap, refracted + shift * (1.0 - 2.0 * t)).rgb * weight;
            total += weight;
        }

        gl_FragColor = vec4(color / max(total, vec3(0.0001)), 1.0);
    }
`

const LensMediaMat = shaderMaterial(
    {
        uMap: new Texture(),
        uMouse: new Vector2(0.5, 0.5),
        uAspect: 1,
        uSize: 0.23,
        uSoftness: 0.38,
        uAberration: 0.17,
        uRefraction: 0.39,
        uHover: 0,
        uDispersion: 50,
    },
    vertexShader,
    fragmentShader,
)

extend({ LensMediaMat })

type LensMediaMaterialProps = {
    map: Texture
    pointer: Pointer
} & Required<Pick<LensEffectProps, "size" | "softness" | "aberration" | "refraction" | "dispersion" | "smoothing">>

// Effect props shared by both the image and video variants.
export type LensEffectProps = {
    size?: number
    softness?: number
    aberration?: number
    refraction?: number
    dispersion?: number
    smoothing?: number
    segments?: number
    webglEnabled?: boolean
}

type LensMediaImageProps = LensEffectProps & {
    type?: "image"
    src: string
    alt: string
} & Omit<React.ComponentPropsWithoutRef<"img">, "src" | "alt">

type LensMediaVideoProps = LensEffectProps & {
    type: "video"
    src: string
} & Omit<React.ComponentPropsWithoutRef<"video">, "src">

export type LensMediaProps = LensMediaImageProps | LensMediaVideoProps

function LensMediaMaterial({
    map,
    pointer,
    size,
    softness,
    aberration,
    refraction,
    dispersion,
    smoothing,
}: LensMediaMaterialProps) {
    const ref = useRef<InstanceType<typeof LensMediaMat>>(null)
    const anchorRef = useRef<Group>(null)

    useFrame((_, delta) => {
        const material = ref.current
        if (!material) return

        const mouse = material.uMouse
        mouse.x = MathUtils.damp(mouse.x, pointer.uv.x, smoothing, delta)
        mouse.y = MathUtils.damp(mouse.y, pointer.uv.y, smoothing, delta)
        material.uHover = MathUtils.damp(material.uHover, pointer.hover, smoothing, delta)

        const parent = anchorRef.current?.parent
        if (parent) material.uAspect = parent.scale.x / parent.scale.y
    })

    return (
        <>
            <group ref={anchorRef} />

            <lensMediaMat
                ref={ref}
                key={LensMediaMat.key}
                uMap={map}
                uSize={size}
                uSoftness={softness}
                uAberration={aberration}
                uRefraction={refraction}
                uDispersion={dispersion}
                transparent
            />
        </>
    )
}

export function LensMedia(props: LensMediaProps) {
    const {
        size = 0.23,
        softness = 0.38,
        aberration = 0.17,
        refraction = 0.39,
        dispersion = 50,
        smoothing = 10,
        segments = 1,
        webglEnabled = true,
        ...rest
    } = props

    // The lens is a fragment-only shader, so the same material runs on both
    // the image and video primitives (they share the WebGL plane contract).
    const material = (map: Texture, pointer: Pointer) => (
        <LensMediaMaterial
            map={map}
            pointer={pointer}
            size={size}
            softness={softness}
            aberration={aberration}
            refraction={refraction}
            dispersion={dispersion}
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
