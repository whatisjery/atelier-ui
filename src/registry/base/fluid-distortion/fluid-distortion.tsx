import type { FboProps } from "@react-three/drei"
import { useFBO } from "@react-three/drei"
import { createPortal, extend, type ThreeElement, useFrame, useThree } from "@react-three/fiber"
import { BlendFunction, Effect, EffectAttribute } from "postprocessing"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import * as THREE from "three"

const baseVertex = /* glsl */ `
#ifdef USE_V_UV
  varying vec2 vUv;
#endif

#ifdef USE_OFFSETS
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform vec2 texelSize;
#endif

void main() {
  #ifdef USE_V_UV
    vUv = uv;
  #endif

  #ifdef USE_OFFSETS
    vL = uv - vec2(texelSize.x, 0.0);
    vR = uv + vec2(texelSize.x, 0.0);
    vT = uv + vec2(0.0, texelSize.y);
    vB = uv - vec2(0.0, texelSize.y);
  #endif

  gl_Position = vec4(position, 1.0);
}
`

const advectionFrag = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 texelSize;
uniform float dt;
uniform float uDissipation;

void main() {
    vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
    gl_FragColor = uDissipation * texture2D(uSource, coord);
    gl_FragColor.a = 1.0;
}
`

const clearFrag = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTexture;
uniform float uClearValue;

void main() { gl_FragColor = uClearValue * texture2D(uTexture, vUv); }
`

const curlFrag = /* glsl */ `
precision highp float;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uVelocity;

void main() {
    float L = texture2D(uVelocity, vL).y;
    float R = texture2D(uVelocity, vR).y;
    float T = texture2D(uVelocity, vT).x;
    float B = texture2D(uVelocity, vB).x;
    float vorticity = R - L - T + B;
    gl_FragColor = vec4(vorticity, 0.0, 0.0, 1.0);
}
`

const divergenceFrag = /* glsl */ `
precision highp float;

varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;

uniform sampler2D uVelocity;

void main() {
    float L = texture2D(uVelocity, vL).x;
    float R = texture2D(uVelocity, vR).x;
    float T = texture2D(uVelocity, vT).y;
    float B = texture2D(uVelocity, vB).y;
    vec2 C = texture2D(uVelocity, vUv).xy;
    if(vL.x < 0.0) { L = -C.x; }
    if(vR.x > 1.0) { R = -C.x; }
    if(vT.y > 1.0) { T = -C.y; }
    if(vB.y < 0.0) { B = -C.y; }
    float div = 0.5 * (R - L + T - B);
    gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
}
`

const gradientSubstractFrag = /* glsl */ `
precision highp float;

varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;
uniform sampler2D uPressure;
uniform sampler2D uVelocity;

void main() {
    float L = texture2D(uPressure, vL).x;
    float R = texture2D(uPressure, vR).x;
    float T = texture2D(uPressure, vT).x;
    float B = texture2D(uPressure, vB).x;
    vec2 velocity = texture2D(uVelocity, vUv).xy;
    velocity.xy -= vec2(R - L, T - B);
    gl_FragColor = vec4(velocity, 0.0, 1.0);
}
`

const pressureFrag = /* glsl */ `
precision highp float;

varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;

uniform sampler2D uPressure;
uniform sampler2D uDivergence;

void main() {
    float L = texture2D(uPressure, vL).x;
    float R = texture2D(uPressure, vR).x;
    float T = texture2D(uPressure, vT).x;
    float B = texture2D(uPressure, vB).x;
    float C = texture2D(uPressure, vUv).x;
    float divergence = texture2D(uDivergence, vUv).x;
    float pressure = (L + R + B + T - divergence) * 0.25;
    gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
}
`

const splatFrag = /* glsl */ `
varying vec2 vUv;

uniform sampler2D uTarget;
uniform float aspectRatio;
uniform vec3 uColor;
uniform vec2 uPointer;
uniform float uRadius;

void main() {
    vec2 p = vUv - uPointer.xy;
    p.x *= aspectRatio;
    vec3 splat = exp(-dot(p, p) / uRadius) * uColor;
    vec3 base = texture2D(uTarget, vUv).xyz;
    gl_FragColor = vec4(base + splat, 1.0);
}
`

const vorticityFrag = /* glsl */ `
precision highp float;

varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;

uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform float uCurlValue;
uniform float dt;

void main() {
    float L = texture2D(uCurl, vL).x;
    float R = texture2D(uCurl, vR).x;
    float T = texture2D(uCurl, vT).x;
    float B = texture2D(uCurl, vB).x;
    float C = texture2D(uCurl, vUv).x;
    vec2 force = vec2(abs(T) - abs(B), abs(R) - abs(L)) * 0.5;
    force /= length(force) + 1.;
    force *= uCurlValue * C;
    force.y *= -1.;
    vec2 vel = texture2D(uVelocity, vUv).xy;
    gl_FragColor = vec4(vel + force * dt, 0.0, 1.0);
}
`

const compositeFrag = /* glsl */ `
uniform sampler2D tFluid;

uniform vec3 uColor;
uniform vec3 uBackgroundColor;

uniform float uDistort;
uniform float uIntensity;
uniform float uRainbow;
uniform float uBlend;
uniform float uShowBackground;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec3 fluidColor = texture2D(tFluid, uv).rgb;
    vec2 distortedUv = uv - fluidColor.rg * uDistort * 0.001;
    vec4 texture = texture2D(inputBuffer, distortedUv);
    float intensity = length(fluidColor) * uIntensity * 0.001;
    vec3 selectedColor = uColor * length(fluidColor) * 0.01;
    vec4 colorForFluidEffect = vec4(uRainbow == 1.0 ? fluidColor : selectedColor, 1.0);
    vec4 computedBgColor = uShowBackground != 0.0 ? vec4(uBackgroundColor, 1.0) : vec4(0.0, 0.0, 0.0, 0.0);
    outputColor = mix(texture, colorForFluidEffect, intensity);
    vec4 computedFluidColor = mix(texture, colorForFluidEffect, uBlend * 0.01);
    vec4 finalColor;

    if(texture.a < 0.1) {
        finalColor = mix(computedBgColor, colorForFluidEffect, intensity);
    } else {
        finalColor = mix(computedFluidColor, computedBgColor, 1.0 - texture.a);
    }

    outputColor = finalColor;
}
`

declare module "@react-three/fiber" {
    interface ThreeElements {
        fluidEffect: ThreeElement<typeof FluidEffect>
    }
}

export type FluidDistortionProps = {
    blend?: number
    intensity?: number
    distortion?: number
    rainbow?: boolean
    fluidColor?: string
    backgroundColor?: string
    showBackground?: boolean
    blendFunction?: BlendFunction
    densityDissipation?: number
    pressure?: number
    velocityDissipation?: number
    force?: number
    radius?: number
    curl?: number
    swirl?: number
}

type Materials = {
    splat: THREE.ShaderMaterial
    curl: THREE.ShaderMaterial
    clear: THREE.ShaderMaterial
    divergence: THREE.ShaderMaterial
    pressure: THREE.ShaderMaterial
    gradientSubstract: THREE.ShaderMaterial
    advection: THREE.ShaderMaterial
    vorticity: THREE.ShaderMaterial
}

type SplatStack = {
    mouseX: number
    mouseY: number
    velocityX: number
    velocityY: number
}

type DoubleFBO = {
    read: THREE.WebGLRenderTarget
    write: THREE.WebGLRenderTarget
    swap: () => void
    dispose: () => void
}

const DYE_RES = 512
const SIM_RES = 128
const REFRESH_RATE = 60
const EMPTY_TEXTURE = new THREE.Texture()

function normalizeScreenHz(value: number, dt: number) {
    return value ** (dt * REFRESH_RATE)
}

class FluidEffect extends Effect {
    private uTFluid: THREE.Uniform<THREE.Texture | null>
    private uDistort: THREE.Uniform<number>
    private uRainbow: THREE.Uniform<boolean>
    private uIntensity: THREE.Uniform<number>
    private uBlend: THREE.Uniform<number>
    private uShowBackground: THREE.Uniform<boolean>
    private uColor: THREE.Uniform<THREE.Color>
    private uBackgroundColor: THREE.Uniform<THREE.Color>

    constructor() {
        const uTFluid = new THREE.Uniform<THREE.Texture | null>(null)
        const uDistort = new THREE.Uniform(0)
        const uRainbow = new THREE.Uniform(false)
        const uIntensity = new THREE.Uniform(0)
        const uBlend = new THREE.Uniform(0)
        const uShowBackground = new THREE.Uniform(false)
        const uColor = new THREE.Uniform(new THREE.Color())
        const uBackgroundColor = new THREE.Uniform(new THREE.Color())

        super("FluidEffect", compositeFrag, {
            uniforms: new Map<string, THREE.Uniform>([
                ["tFluid", uTFluid],
                ["uDistort", uDistort],
                ["uRainbow", uRainbow],
                ["uIntensity", uIntensity],
                ["uBlend", uBlend],
                ["uShowBackground", uShowBackground],
                ["uColor", uColor],
                ["uBackgroundColor", uBackgroundColor],
            ]),
        })

        this.uTFluid = uTFluid
        this.uDistort = uDistort
        this.uRainbow = uRainbow
        this.uIntensity = uIntensity
        this.uBlend = uBlend
        this.uShowBackground = uShowBackground
        this.uColor = uColor
        this.uBackgroundColor = uBackgroundColor
    }

    set tFluid(v: THREE.Texture) {
        this.uTFluid.value = v
    }
    set distortion(v: number) {
        this.uDistort.value = v
    }
    set rainbow(v: boolean) {
        this.uRainbow.value = v
    }
    set intensity(v: number) {
        this.uIntensity.value = v
    }
    set blend(v: number) {
        this.uBlend.value = v
    }
    set showBackground(v: boolean) {
        this.uShowBackground.value = v
    }
    set fluidColor(v: string) {
        this.uColor.value.set(v)
    }
    set backgroundColor(v: string) {
        this.uBackgroundColor.value.set(v)
    }
    set blendFunction(v: BlendFunction) {
        this.blendMode.blendFunction = v
    }
}

extend({ FluidEffect })

// derived from useFBO: 2 render targets we swap between, so a shader can read from one and write to the other
function useDoubleFBO(width: number, height: number, options: FboProps) {
    const read = useFBO(width, height, options)
    const write = useFBO(width, height, options)

    const fbo = useMemo(
        () => ({
            read,
            write,
            swap() {
                const temp = this.read
                this.read = this.write
                this.write = temp
            },
            dispose() {
                read.dispose()
                write.dispose()
            },
        }),
        [read, write],
    )

    return fbo
}

export const FluidDistortion = ({
    blend = 5,
    force = 1.1,
    radius = 0.65,
    curl = 0.8,
    swirl = 2,
    intensity = 7,
    distortion = 0.8,
    fluidColor = "#b4a6ff",
    backgroundColor = "#070410",
    showBackground = false,
    rainbow = false,
    pressure = 0.7,
    densityDissipation = 0.98,
    velocityDissipation = 0.98,
    blendFunction = BlendFunction.SET,
}: FluidDistortionProps) => {
    const size = useThree((three) => three.size)
    const gl = useThree((three) => three.gl)
    const [bufferScene] = useState(() => new THREE.Scene())
    const bufferCamera = useMemo(() => new THREE.Camera(), [])
    const meshRef = useRef<THREE.Mesh>(null)
    const pointerRef = useRef(new THREE.Vector2())
    const colorRef = useRef(new THREE.Vector3())
    const splatStack = useRef<SplatStack[]>([])
    const lastMouse = useRef<THREE.Vector2>(new THREE.Vector2())
    const hasMoved = useRef<boolean>(false)
    const rectRef = useRef<DOMRect | null>(null)

    // cache rect so onPointerMove doesn't trigger layout on each event
    useEffect(() => {
        rectRef.current = gl.domElement.getBoundingClientRect()
    }, [gl.domElement, size])

    const densityFBO = useDoubleFBO(DYE_RES, DYE_RES, {
        type: THREE.HalfFloatType,
        format: THREE.RGBAFormat,
        minFilter: THREE.LinearFilter,
        depthBuffer: false,
        generateMipmaps: false,
    })

    const velocityFBO = useDoubleFBO(SIM_RES, SIM_RES, {
        type: THREE.HalfFloatType,
        format: THREE.RGFormat,
        minFilter: THREE.LinearFilter,
        depthBuffer: false,
        generateMipmaps: false,
    })

    const pressureFBO = useDoubleFBO(SIM_RES, SIM_RES, {
        type: THREE.HalfFloatType,
        format: THREE.RedFormat,
        minFilter: THREE.NearestFilter,
        depthBuffer: false,
        generateMipmaps: false,
    })

    const divergenceFBO = useFBO(SIM_RES, SIM_RES, {
        type: THREE.HalfFloatType,
        format: THREE.RedFormat,
        minFilter: THREE.NearestFilter,
        depthBuffer: false,
        generateMipmaps: false,
    })

    const curlFBO = useFBO(SIM_RES, SIM_RES, {
        type: THREE.HalfFloatType,
        format: THREE.RedFormat,
        minFilter: THREE.NearestFilter,
        depthBuffer: false,
        generateMipmaps: false,
    })

    const materials = useMemo<Materials>(() => {
        const advection = new THREE.ShaderMaterial({
            name: "Fluid/Advection",
            uniforms: {
                uVelocity: { value: EMPTY_TEXTURE },
                uSource: { value: EMPTY_TEXTURE },
                dt: { value: 1 / REFRESH_RATE },
                uDissipation: { value: 1.0 },
                texelSize: { value: new THREE.Vector2() },
            },
            fragmentShader: advectionFrag,
            vertexShader: baseVertex,
            defines: { USE_V_UV: "" },
            depthTest: false,
            depthWrite: false,
        })

        const clear = new THREE.ShaderMaterial({
            name: "Fluid/Clear",
            uniforms: {
                uTexture: { value: EMPTY_TEXTURE },
                uClearValue: { value: 0 },
                texelSize: { value: new THREE.Vector2() },
            },
            fragmentShader: clearFrag,
            vertexShader: baseVertex,
            defines: { USE_V_UV: "" },
            depthTest: false,
            depthWrite: false,
        })

        const curl = new THREE.ShaderMaterial({
            name: "Fluid/Curl",
            uniforms: {
                uVelocity: { value: EMPTY_TEXTURE },
                texelSize: { value: new THREE.Vector2() },
            },
            fragmentShader: curlFrag,
            vertexShader: baseVertex,
            defines: { USE_OFFSETS: "" },
            depthTest: false,
            depthWrite: false,
        })

        const divergence = new THREE.ShaderMaterial({
            name: "Fluid/Divergence",
            uniforms: {
                uVelocity: { value: EMPTY_TEXTURE },
                texelSize: { value: new THREE.Vector2() },
            },
            fragmentShader: divergenceFrag,
            vertexShader: baseVertex,
            defines: { USE_V_UV: "", USE_OFFSETS: "" },
            depthTest: false,
            depthWrite: false,
        })

        const gradientSubstract = new THREE.ShaderMaterial({
            name: "Fluid/GradientSubtract",
            uniforms: {
                uPressure: { value: EMPTY_TEXTURE },
                uVelocity: { value: EMPTY_TEXTURE },
                texelSize: { value: new THREE.Vector2() },
            },
            fragmentShader: gradientSubstractFrag,
            vertexShader: baseVertex,
            defines: { USE_V_UV: "", USE_OFFSETS: "" },
            depthTest: false,
            depthWrite: false,
        })

        const pressure = new THREE.ShaderMaterial({
            name: "Fluid/Pressure",
            uniforms: {
                uPressure: { value: EMPTY_TEXTURE },
                uDivergence: { value: EMPTY_TEXTURE },
                texelSize: { value: new THREE.Vector2() },
            },
            fragmentShader: pressureFrag,
            vertexShader: baseVertex,
            defines: { USE_V_UV: "", USE_OFFSETS: "" },
            depthTest: false,
            depthWrite: false,
        })

        const splat = new THREE.ShaderMaterial({
            name: "Fluid/Splat",
            uniforms: {
                uTarget: { value: EMPTY_TEXTURE },
                aspectRatio: { value: 1 },
                uColor: { value: new THREE.Vector3() },
                uPointer: { value: new THREE.Vector2() },
                uRadius: { value: 0 },
                texelSize: { value: new THREE.Vector2() },
            },
            fragmentShader: splatFrag,
            vertexShader: baseVertex,
            defines: { USE_V_UV: "" },
            depthTest: false,
            depthWrite: false,
        })

        const vorticity = new THREE.ShaderMaterial({
            name: "Fluid/Vorticity",
            uniforms: {
                uVelocity: { value: EMPTY_TEXTURE },
                uCurl: { value: EMPTY_TEXTURE },
                uCurlValue: { value: 0 },
                dt: { value: 1 / REFRESH_RATE },
                texelSize: { value: new THREE.Vector2() },
            },
            fragmentShader: vorticityFrag,
            vertexShader: baseVertex,
            defines: { USE_V_UV: "", USE_OFFSETS: "" },
            depthTest: false,
            depthWrite: false,
        })

        return {
            splat,
            curl,
            clear,
            divergence,
            pressure,
            gradientSubstract,
            advection,
            vorticity,
        }
    }, [])

    useEffect(() => {
        const texelAspect = size.width / size.height
        for (const material of Object.values(materials)) {
            material.uniforms.texelSize.value.set(1 / (SIM_RES * texelAspect), 1 / SIM_RES)
        }
        materials.splat.uniforms.aspectRatio.value = size.width / size.height
    }, [materials, size])

    useEffect(() => {
        return () => {
            for (const material of Object.values(materials)) {
                material.dispose()
            }
        }
    }, [materials])

    const onPointerMove = useCallback(
        (event: PointerEvent) => {
            const rect = rectRef.current
            if (!rect) return

            const x = event.clientX - rect.left
            const y = event.clientY - rect.top

            const deltaX = x - lastMouse.current.x
            const deltaY = y - lastMouse.current.y

            if (!hasMoved.current) {
                hasMoved.current = true
                lastMouse.current.set(x, y)
                return
            }

            lastMouse.current.set(x, y)

            splatStack.current.push({
                mouseX: x / rect.width,
                mouseY: 1.0 - y / rect.height,
                velocityX: deltaX * force,
                velocityY: -deltaY * force,
            })
        },
        [force],
    )

    useEffect(() => {
        function onPointerDown() {
            hasMoved.current = false
        }
        addEventListener("pointermove", onPointerMove, { passive: true })
        addEventListener("pointerdown", onPointerDown, { passive: true })
        return () => {
            removeEventListener("pointermove", onPointerMove)
            removeEventListener("pointerdown", onPointerDown)
        }
    }, [onPointerMove])

    const setRenderTarget = (fbo: THREE.WebGLRenderTarget | DoubleFBO) => {
        // checking if it's a DoubleFBO
        if ("write" in fbo) {
            gl.setRenderTarget(fbo.write)
            gl.clear()
            gl.render(bufferScene, bufferCamera)
            fbo.swap()
        } else {
            gl.setRenderTarget(fbo)
            gl.clear()
            gl.render(bufferScene, bufferCamera)
        }
    }

    useFrame((_, delta) => {
        const mesh = meshRef.current
        if (!mesh) return

        for (let i = splatStack.current.length - 1; i >= 0; i--) {
            const { mouseX, mouseY, velocityX, velocityY } = splatStack.current[i]

            pointerRef.current.set(mouseX, mouseY)
            colorRef.current.set(velocityX, velocityY, 2.0)

            mesh.material = materials.splat
            materials.splat.uniforms.uTarget.value = velocityFBO.read.texture
            materials.splat.uniforms.uPointer.value = pointerRef.current
            materials.splat.uniforms.uColor.value = colorRef.current
            materials.splat.uniforms.uRadius.value = radius / 100.0
            setRenderTarget(velocityFBO)

            materials.splat.uniforms.uTarget.value = densityFBO.read.texture
            setRenderTarget(densityFBO)

            splatStack.current.pop()
        }

        mesh.material = materials.curl
        materials.curl.uniforms.uVelocity.value = velocityFBO.read.texture
        setRenderTarget(curlFBO)

        mesh.material = materials.vorticity
        materials.vorticity.uniforms.uVelocity.value = velocityFBO.read.texture
        materials.vorticity.uniforms.uCurl.value = curlFBO.texture
        materials.vorticity.uniforms.uCurlValue.value = curl
        setRenderTarget(velocityFBO)

        mesh.material = materials.divergence
        materials.divergence.uniforms.uVelocity.value = velocityFBO.read.texture
        setRenderTarget(divergenceFBO)

        mesh.material = materials.clear
        materials.clear.uniforms.uTexture.value = pressureFBO.read.texture
        materials.clear.uniforms.uClearValue.value = normalizeScreenHz(pressure, delta)
        setRenderTarget(pressureFBO)

        mesh.material = materials.pressure
        materials.pressure.uniforms.uDivergence.value = divergenceFBO.texture

        for (let i = 0; i < swirl; i++) {
            materials.pressure.uniforms.uPressure.value = pressureFBO.read.texture
            setRenderTarget(pressureFBO)
        }

        mesh.material = materials.gradientSubstract
        materials.gradientSubstract.uniforms.uPressure.value = pressureFBO.read.texture
        materials.gradientSubstract.uniforms.uVelocity.value = velocityFBO.read.texture
        setRenderTarget(velocityFBO)

        mesh.material = materials.advection
        materials.advection.uniforms.uVelocity.value = velocityFBO.read.texture
        materials.advection.uniforms.uSource.value = velocityFBO.read.texture
        materials.advection.uniforms.uDissipation.value = normalizeScreenHz(
            velocityDissipation,
            delta,
        )

        setRenderTarget(velocityFBO)
        materials.advection.uniforms.uVelocity.value = velocityFBO.read.texture
        materials.advection.uniforms.uSource.value = densityFBO.read.texture
        materials.advection.uniforms.uDissipation.value = normalizeScreenHz(
            densityDissipation,
            delta,
        )

        setRenderTarget(densityFBO)
    })

    return (
        <>
            {createPortal(
                <mesh ref={meshRef} scale={[size.width, size.height, 1]}>
                    <planeGeometry args={[2, 2]} />
                </mesh>,
                bufferScene,
            )}
            <fluidEffect
                blend={blend}
                intensity={intensity}
                distortion={distortion}
                rainbow={rainbow}
                fluidColor={fluidColor}
                backgroundColor={backgroundColor}
                showBackground={showBackground}
                blendFunction={blendFunction}
                tFluid={densityFBO.read.texture}
            />
        </>
    )
}
