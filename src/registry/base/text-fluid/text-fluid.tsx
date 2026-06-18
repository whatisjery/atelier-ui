import { shaderMaterial } from "@react-three/drei"
import { extend, type ThreeElement, useFrame } from "@react-three/fiber"
import { useRef } from "react"
import { Texture } from "three"
import type { RenderProp } from "../../hooks/use-render"
import { WebglText } from "../webgl-text/webgl-text"

declare module "@react-three/fiber" {
    interface ThreeElements {
        textFluidMat: ThreeElement<typeof TextFluidMat>
    }
}

const vertexShader = /* glsl */ `
varying vec2 vUv;
uniform float uTime;
uniform float uNoiseFrequency;
uniform float uNoiseAmplitude;

float rand(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float noise(vec2 p) {
    vec2 ip = floor(p);
    vec2 u = fract(p);
    u = u * u * (3.0 - 2.0 * u);
    float res = mix(
        mix(rand(ip), rand(ip + vec2(1.0, 0.0)), u.x),
        mix(rand(ip + vec2(0.0, 1.0)), rand(ip + vec2(1.0, 1.0)), u.x),
        u.y
    );
    return res * res;
}

float fbm(vec2 x) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    for (int i = 0; i < 6; ++i) {
        v += a * noise(x);
        x = rot * x * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}

void main() {
    vUv = uv;
    vec3 newPos = position;

    float n = fbm(newPos.xy * uNoiseFrequency + uTime);
    newPos.y += (n - 0.25) * uNoiseAmplitude * 50.0;
    newPos.x += (n - 0.25) * uNoiseAmplitude * 100.0;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
}
`

const fragmentShader = /* glsl */ `
precision highp float;

uniform sampler2D uTexture;
uniform float uTime;
uniform float uRippleStrength;
uniform float uOpacity;

varying vec2 vUv;

void main() {
    vec2 uv = vUv;
    uv.x += sin(vUv.y * 8.5 + uTime * 1.8) * uRippleStrength;
    uv.y += cos(vUv.x * 8.5 + uTime * 1.4) * uRippleStrength;
    uv = clamp(uv, 0.0, 1.0);

    vec4 tex = texture2D(uTexture, uv);
    if (tex.a < 0.01) discard;

    gl_FragColor = vec4(tex.rgb, tex.a * uOpacity);
}
`

const TextFluidMat = shaderMaterial(
    {
        uTexture: new Texture(),
        uTime: 0,
        uRippleStrength: 0,
        uNoiseFrequency: 0,
        uNoiseAmplitude: 0,
        uOpacity: 0,
    },
    vertexShader,
    fragmentShader,
)

extend({ TextFluidMat })

export type DynamicNumber = number | (() => number)
const read = (v: DynamicNumber) => (typeof v === "function" ? v() : v)

export type TextFluidProps = {
    children: string
    speed?: number
    ripple?: DynamicNumber
    frequency?: DynamicNumber
    amplitude?: DynamicNumber
    opacity?: DynamicNumber
    segments?: number
    webglEnabled?: boolean
    render?: RenderProp
}

type TextFluidMaterialProps = {
    uTexture: Texture
} & Required<Pick<TextFluidProps, "speed" | "ripple" | "frequency" | "amplitude" | "opacity">>

function TextFluidMaterial({
    uTexture,
    speed,
    ripple,
    frequency,
    amplitude,
    opacity,
}: TextFluidMaterialProps) {
    const ref = useRef<InstanceType<typeof TextFluidMat>>(null)

    useFrame(({ clock }) => {
        const mat = ref.current
        if (!mat) return
        mat.uTime = clock.getElapsedTime() * speed
        mat.uRippleStrength = read(ripple)
        mat.uNoiseFrequency = read(frequency)
        mat.uNoiseAmplitude = read(amplitude)
        mat.uOpacity = read(opacity)
    })

    return (
        <textFluidMat
            ref={ref}
            key={TextFluidMat.key}
            attach="material"
            uTexture={uTexture}
            transparent
            depthWrite={false}
        />
    )
}

export function TextFluid({
    children,
    speed = 0.2,
    ripple = 0.015,
    frequency = 1.5,
    amplitude = 0.002,
    opacity = 1,
    segments = 20,
    webglEnabled = true,
    render,
}: TextFluidProps) {
    return (
        <WebglText
            render={render}
            segments={segments}
            webglEnabled={webglEnabled}
            material={(uTexture) => (
                <TextFluidMaterial
                    uTexture={uTexture}
                    speed={speed}
                    ripple={ripple}
                    frequency={frequency}
                    amplitude={amplitude}
                    opacity={opacity}
                />
            )}
        >
            {children}
        </WebglText>
    )
}
