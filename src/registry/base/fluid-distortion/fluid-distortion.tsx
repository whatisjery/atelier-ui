import type { FboProps } from "@react-three/drei"
import { useFBO } from "@react-three/drei"
import { createPortal, useFrame, useThree } from "@react-three/fiber"
import { BlendFunction, Effect, EffectAttribute } from "postprocessing"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
    Camera,
    Color,
    HalfFloatType,
    LinearFilter,
    type Mesh,
    NearestFilter,
    RedFormat,
    RGBAFormat,
    RGFormat,
    Scene,
    ShaderMaterial,
    Texture,
    Uniform,
    Vector2,
    Vector3,
} from "three"

export const DEFAULT_CONFIG = {
    blend: 5,
    intensity: 7,
    force: 1.1,
    distortion: 0.8,
    curl: 0.8,
    radius: 0.5,
    swirl: 2,
    pressure: 0.7,
    densityDissipation: 0.98,
    velocityDissipation: 0.98,
    fluidColor: "#b4a6ff",
    backgroundColor: "#070410",
    showBackground: false,
    rainbow: false,
    dyeRes: 512,
    simRes: 128,
    blendFunction: BlendFunction.SET,
} as const

const REFRESH_RATE = 60

const baseVertex = `
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

const advectionFrag = `
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

const clearFrag = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTexture;
uniform float uClearValue;

void main() { gl_FragColor = uClearValue * texture2D(uTexture, vUv); }
`

const curlFrag = `
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

const divergenceFrag = `
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

const gradientSubstractFrag = `
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

const pressureFrag = `
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

const splatFrag = `
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

const vorticityFrag = `
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

const compositeFrag = `
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

type EffectProps = Required<
    Pick<
        FluidDistortionProps,
        | "blend"
        | "intensity"
        | "distortion"
        | "rainbow"
        | "fluidColor"
        | "backgroundColor"
        | "showBackground"
        | "blendFunction"
    >
> & { tFluid: Texture }

type EffectUniforms = {
    tFluid: Texture
    uColor: Vector3
    uBackgroundColor: Vector3
    uRainbow: boolean
    uShowBackground: boolean
    uDistort: number
    uBlend: number
    uIntensity: number
}

type Materials = {
    splat: ShaderMaterial
    curl: ShaderMaterial
    clear: ShaderMaterial
    divergence: ShaderMaterial
    pressure: ShaderMaterial
    gradientSubstract: ShaderMaterial
    advection: ShaderMaterial
    vorticity: ShaderMaterial
}

type SplatStack = {
    mouseX: number
    mouseY: number
    velocityX: number
    velocityY: number
}

function hexToRgb(hex: string) {
    const color = new Color(hex)
    return new Vector3(color.r, color.g, color.b)
}

function normalizeScreenHz(value: number, dt: number) {
    return value ** (dt * REFRESH_RATE)
}

class FluidEffect extends Effect {
    state: EffectProps

    constructor(props: EffectProps) {
        const uniforms: Record<keyof EffectUniforms, Uniform> = {
            tFluid: new Uniform(props.tFluid),
            uDistort: new Uniform(props.distortion),
            uRainbow: new Uniform(props.rainbow),
            uIntensity: new Uniform(props.intensity),
            uBlend: new Uniform(props.blend),
            uShowBackground: new Uniform(props.showBackground),
            uColor: new Uniform(hexToRgb(props.fluidColor)),
            uBackgroundColor: new Uniform(hexToRgb(props.backgroundColor)),
        }

        super("FluidEffect", compositeFrag, {
            blendFunction: props.blendFunction,
            attributes: EffectAttribute.CONVOLUTION,
            uniforms: new Map(Object.entries(uniforms)),
        })

        this.state = props
    }

    private updateUniform<K extends keyof EffectUniforms>(key: K, value: EffectUniforms[K]) {
        const uniform = this.uniforms.get(key)
        if (uniform) {
            uniform.value = value
        }
    }

    update() {
        this.updateUniform("uIntensity", this.state.intensity)
        this.updateUniform("uDistort", this.state.distortion)
        this.updateUniform("uRainbow", this.state.rainbow)
        this.updateUniform("uBlend", this.state.blend)
        this.updateUniform("uShowBackground", this.state.showBackground)
        this.updateUniform("uColor", hexToRgb(this.state.fluidColor))
        this.updateUniform("uBackgroundColor", hexToRgb(this.state.backgroundColor))
    }
}

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

function useFBOs() {
    const density = useDoubleFBO(DEFAULT_CONFIG.dyeRes, DEFAULT_CONFIG.dyeRes, {
        type: HalfFloatType,
        format: RGBAFormat,
        minFilter: LinearFilter,
        depthBuffer: false,
    })

    const velocity = useDoubleFBO(DEFAULT_CONFIG.simRes, DEFAULT_CONFIG.simRes, {
        type: HalfFloatType,
        format: RGFormat,
        minFilter: LinearFilter,
        depthBuffer: false,
    })

    const pressure = useDoubleFBO(DEFAULT_CONFIG.simRes, DEFAULT_CONFIG.simRes, {
        type: HalfFloatType,
        format: RedFormat,
        minFilter: NearestFilter,
        depthBuffer: false,
    })

    const divergence = useFBO(DEFAULT_CONFIG.simRes, DEFAULT_CONFIG.simRes, {
        type: HalfFloatType,
        format: RedFormat,
        minFilter: NearestFilter,
        depthBuffer: false,
    })

    const curl = useFBO(DEFAULT_CONFIG.simRes, DEFAULT_CONFIG.simRes, {
        type: HalfFloatType,
        format: RedFormat,
        minFilter: NearestFilter,
        depthBuffer: false,
    })

    const FBOs = useMemo(
        () => ({ density, velocity, pressure, divergence, curl }),
        [curl, density, divergence, pressure, velocity],
    )

    useEffect(() => {
        for (const FBO of Object.values(FBOs)) {
            if ("write" in FBO) {
                FBO.read.texture.generateMipmaps = false
                FBO.write.texture.generateMipmaps = false
            } else {
                FBO.texture.generateMipmaps = false
            }
        }

        return () => {
            for (const FBO of Object.values(FBOs)) {
                FBO.dispose()
            }
        }
    }, [FBOs])

    return FBOs
}

function useMaterials(): Materials {
    const size = useThree((s) => s.size)

    const materials = useMemo<Materials>(() => {
        const advection = new ShaderMaterial({
            name: "Fluid/Advection",
            uniforms: {
                uVelocity: { value: new Texture() },
                uSource: { value: new Texture() },
                dt: { value: 1 / REFRESH_RATE },
                uDissipation: { value: 1.0 },
                texelSize: { value: new Vector2() },
            },
            fragmentShader: advectionFrag,
            vertexShader: baseVertex,
            defines: { USE_V_UV: "" },
            depthTest: false,
            depthWrite: false,
        })

        const clear = new ShaderMaterial({
            name: "Fluid/Clear",
            uniforms: {
                uTexture: { value: new Texture() },
                uClearValue: { value: DEFAULT_CONFIG.pressure },
                texelSize: { value: new Vector2() },
            },
            fragmentShader: clearFrag,
            vertexShader: baseVertex,
            defines: { USE_V_UV: "" },
            depthTest: false,
            depthWrite: false,
        })

        const curl = new ShaderMaterial({
            name: "Fluid/Curl",
            uniforms: {
                uVelocity: { value: new Texture() },
                texelSize: { value: new Vector2() },
            },
            fragmentShader: curlFrag,
            vertexShader: baseVertex,
            defines: { USE_OFFSETS: "" },
            depthTest: false,
            depthWrite: false,
        })

        const divergence = new ShaderMaterial({
            name: "Fluid/Divergence",
            uniforms: {
                uVelocity: { value: new Texture() },
                texelSize: { value: new Vector2() },
            },
            fragmentShader: divergenceFrag,
            vertexShader: baseVertex,
            defines: { USE_V_UV: "", USE_OFFSETS: "" },
            depthTest: false,
            depthWrite: false,
        })

        const gradientSubstract = new ShaderMaterial({
            name: "Fluid/GradientSubtract",
            uniforms: {
                uPressure: { value: new Texture() },
                uVelocity: { value: new Texture() },
                texelSize: { value: new Vector2() },
            },
            fragmentShader: gradientSubstractFrag,
            vertexShader: baseVertex,
            defines: { USE_V_UV: "", USE_OFFSETS: "" },
            depthTest: false,
            depthWrite: false,
        })

        const pressure = new ShaderMaterial({
            name: "Fluid/Pressure",
            uniforms: {
                uPressure: { value: new Texture() },
                uDivergence: { value: new Texture() },
                texelSize: { value: new Vector2() },
            },
            fragmentShader: pressureFrag,
            vertexShader: baseVertex,
            defines: { USE_V_UV: "", USE_OFFSETS: "" },
            depthTest: false,
            depthWrite: false,
        })

        const splat = new ShaderMaterial({
            name: "Fluid/Splat",
            uniforms: {
                uTarget: { value: new Texture() },
                aspectRatio: { value: size.width / size.height },
                uColor: { value: new Vector3() },
                uPointer: { value: new Vector2() },
                uRadius: { value: DEFAULT_CONFIG.radius / 100.0 },
                texelSize: { value: new Vector2() },
            },
            fragmentShader: splatFrag,
            vertexShader: baseVertex,
            defines: { USE_V_UV: "" },
            depthTest: false,
            depthWrite: false,
        })

        const vorticity = new ShaderMaterial({
            name: "Fluid/Vorticity",
            uniforms: {
                uVelocity: { value: new Texture() },
                uCurl: { value: new Texture() },
                uCurlValue: { value: DEFAULT_CONFIG.curl },
                dt: { value: 1 / REFRESH_RATE },
                texelSize: { value: new Vector2() },
            },
            fragmentShader: vorticityFrag,
            vertexShader: baseVertex,
            defines: { USE_V_UV: "", USE_OFFSETS: "" },
            depthTest: false,
            depthWrite: false,
        })

        return { splat, curl, clear, divergence, pressure, gradientSubstract, advection, vorticity }
    }, [size])

    useEffect(() => {
        for (const material of Object.values(materials)) {
            const aspectRatio = size.width / (size.height + 400)
            material.uniforms.texelSize.value.set(
                1 / (DEFAULT_CONFIG.simRes * aspectRatio),
                1 / DEFAULT_CONFIG.simRes,
            )
        }

        return () => {
            for (const material of Object.values(materials)) {
                material.dispose()
            }
        }
    }, [materials, size])

    return materials
}

function usePointer({ force }: { force: number }) {
    const gl = useThree((three) => three.gl)

    const splatStack = useRef<SplatStack[]>([])
    const lastMouse = useRef<Vector2>(new Vector2())
    const hasMoved = useRef<boolean>(false)

    const onPointerMove = useCallback(
        (event: PointerEvent) => {
            const canvas = gl.domElement
            const rect = canvas.getBoundingClientRect()

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
        [force, gl.domElement],
    )

    useEffect(() => {
        addEventListener("pointermove", onPointerMove)
        return () => {
            removeEventListener("pointermove", onPointerMove)
        }
    }, [onPointerMove])

    return splatStack
}

export const FluidDistortion = ({
    blend = DEFAULT_CONFIG.blend,
    force = DEFAULT_CONFIG.force,
    radius = DEFAULT_CONFIG.radius,
    curl = DEFAULT_CONFIG.curl,
    swirl = DEFAULT_CONFIG.swirl,
    intensity = DEFAULT_CONFIG.intensity,
    distortion = DEFAULT_CONFIG.distortion,
    fluidColor = DEFAULT_CONFIG.fluidColor,
    backgroundColor = DEFAULT_CONFIG.backgroundColor,
    showBackground = DEFAULT_CONFIG.showBackground,
    rainbow = DEFAULT_CONFIG.rainbow,
    pressure = DEFAULT_CONFIG.pressure,
    densityDissipation = DEFAULT_CONFIG.densityDissipation,
    velocityDissipation = DEFAULT_CONFIG.velocityDissipation,
    blendFunction = DEFAULT_CONFIG.blendFunction,
}: FluidDistortionProps) => {
    const size = useThree((three) => three.size)
    const gl = useThree((three) => three.gl)

    const [bufferScene] = useState(() => new Scene())
    const bufferCamera = useMemo(() => new Camera(), [])

    const meshRef = useRef<Mesh>(null)
    const pointerRef = useRef(new Vector2())
    const colorRef = useRef(new Vector3())

    const FBOs = useFBOs()
    const materials = useMaterials()
    const splatStack = usePointer({ force }).current

    const setShaderMaterial = useCallback(
        (name: keyof Materials) => {
            if (!meshRef.current) return
            meshRef.current.material = materials[name]
            meshRef.current.material.needsUpdate = true
        },
        [materials],
    )

    const setRenderTarget = useCallback(
        (name: keyof typeof FBOs) => {
            const target = FBOs[name]
            if ("write" in target) {
                gl.setRenderTarget(target.write)
                gl.clear()
                gl.render(bufferScene, bufferCamera)
                target.swap()
            } else {
                gl.setRenderTarget(target)
                gl.clear()
                gl.render(bufferScene, bufferCamera)
            }
        },
        [bufferCamera, bufferScene, FBOs, gl],
    )

    const setUniforms = useCallback(
        (material: keyof Materials, uniform: string, value: unknown) => {
            const mat = materials[material]
            if (mat?.uniforms[uniform]) {
                mat.uniforms[uniform].value = value
            }
        },
        [materials],
    )

    useFrame((_, delta) => {
        if (!meshRef.current) return

        for (let i = splatStack.length - 1; i >= 0; i--) {
            const { mouseX, mouseY, velocityX, velocityY } = splatStack[i]

            pointerRef.current.set(mouseX, mouseY)
            colorRef.current.set(velocityX, velocityY, 2.0)

            setShaderMaterial("splat")
            setUniforms("splat", "uTarget", FBOs.velocity.read.texture)
            setUniforms("splat", "uPointer", pointerRef.current)
            setUniforms("splat", "uColor", colorRef.current)
            setUniforms("splat", "uRadius", radius / 100.0)
            setRenderTarget("velocity")
            setUniforms("splat", "uTarget", FBOs.density.read.texture)
            setRenderTarget("density")

            splatStack.pop()
        }

        setShaderMaterial("curl")
        setUniforms("curl", "uVelocity", FBOs.velocity.read.texture)
        setRenderTarget("curl")

        setShaderMaterial("vorticity")
        setUniforms("vorticity", "uVelocity", FBOs.velocity.read.texture)
        setUniforms("vorticity", "uCurl", FBOs.curl.texture)
        setUniforms("vorticity", "uCurlValue", curl)
        setRenderTarget("velocity")

        setShaderMaterial("divergence")
        setUniforms("divergence", "uVelocity", FBOs.velocity.read.texture)
        setRenderTarget("divergence")

        setShaderMaterial("clear")
        setUniforms("clear", "uTexture", FBOs.pressure.read.texture)
        setUniforms("clear", "uClearValue", normalizeScreenHz(pressure, delta))
        setRenderTarget("pressure")

        setShaderMaterial("pressure")
        setUniforms("pressure", "uDivergence", FBOs.divergence.texture)

        for (let i = 0; i < swirl; i++) {
            setUniforms("pressure", "uPressure", FBOs.pressure.read.texture)
            setRenderTarget("pressure")
        }

        setShaderMaterial("gradientSubstract")
        setUniforms("gradientSubstract", "uPressure", FBOs.pressure.read.texture)
        setUniforms("gradientSubstract", "uVelocity", FBOs.velocity.read.texture)
        setRenderTarget("velocity")

        setShaderMaterial("advection")
        setUniforms("advection", "uVelocity", FBOs.velocity.read.texture)
        setUniforms("advection", "uSource", FBOs.velocity.read.texture)
        setUniforms("advection", "uDissipation", normalizeScreenHz(velocityDissipation, delta))

        setRenderTarget("velocity")
        setUniforms("advection", "uVelocity", FBOs.velocity.read.texture)
        setUniforms("advection", "uSource", FBOs.density.read.texture)
        setUniforms("advection", "uDissipation", normalizeScreenHz(densityDissipation, delta))

        setRenderTarget("density")
    })

    const effectProps: EffectProps = {
        blend,
        intensity,
        distortion,
        rainbow,
        backgroundColor,
        fluidColor,
        showBackground,
        blendFunction,
        tFluid: FBOs.density.read.texture,
    }

    const effect = useMemo(() => new FluidEffect(effectProps), [])

    useEffect(() => {
        effect.state = effectProps
        effect.update()
    })

    useEffect(() => {
        return () => {
            effect.dispose?.()
        }
    }, [effect])

    return (
        <>
            {createPortal(
                <mesh ref={meshRef} scale={[size.width, size.height, 1]}>
                    <planeGeometry args={[2, 2]} />
                </mesh>,
                bufferScene,
            )}
            <primitive object={effect} dispose={null} />
        </>
    )
}
