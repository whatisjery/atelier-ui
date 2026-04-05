import { useFBO } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { useCallback, useEffect, useMemo, useState } from "react"
import {
    Color,
    HalfFloatType,
    LinearFilter,
    Mesh,
    OrthographicCamera,
    PlaneGeometry,
    Scene,
    ShaderMaterial,
    type Texture,
    Vector2,
    type WebGLRenderTarget,
} from "three"

const vert = /* glsl */ `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`

const baseFrag = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform float uSpeed;
uniform float uEdgeSize;
uniform vec2 uResolution;

float edgeGlowIntensity(vec2 uv, float thickness) {
    float distToEdge = min(min(uv.x, uv.y), min(1.0 - uv.x, 1.0 - uv.y));
    float scaledThickness = thickness * 1.5;
    float glow = scaledThickness / (1.0 - smoothstep(0.12, 0.01, distToEdge + 0.02));
    return glow * pow(1.0 - distToEdge, 3.0);
}

float ringIntensity(vec2 uv, float time) {
    float aspectRatio = uResolution.x / uResolution.y;
    vec2 center = vec2(0.5);
    vec2 pixel = uv;
    pixel.x *= aspectRatio;
    center.x *= aspectRatio;
    pixel *= vec2(0.82, 1.15);
    center *= vec2(0.82, 1.15);
    float progress = fract(time * 0.02 * uSpeed);
    float ringRadius = 1.1 * progress;
    float distFromRing = abs(length(pixel - center) - ringRadius);
    float ringWidth = 0.5 * progress;
    float brightness = ringWidth / (1.0 - smoothstep(0.2, 0.002, distFromRing + 0.02));
    brightness *= max(0.0, 1.0 - progress);
    return brightness * pow(max(0.0, 1.0 - distFromRing), 3.0);
}

void main() {
    float thinEdge = edgeGlowIntensity(vUv, 0.02 * uEdgeSize);
    float wideEdge = edgeGlowIntensity(vUv, 0.08 * uEdgeSize);
    float ring     = ringIntensity(vUv, uTime);
    gl_FragColor = vec4(thinEdge, wideEdge, ring, 1.0);
}`

const noiseFrag = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTexture;
uniform float uTime;
uniform float uSpeed;
uniform vec2 uResolution;
uniform float uEdgeDistortion;
uniform float uRingDistortion;
uniform vec3 uEdgeColor;
uniform vec3 uRingColor;

vec3 tanhApprox(vec3 x) {
    vec3 x2 = x * x;
    return x * (27.0 + x2) / (27.0 + 9.0 * x2);
}

vec4 permute(vec4 t) { return t * (t * 34.0 + 133.0); }

vec3 grad(float hash) {
    vec3 cube = mod(floor(hash / vec3(1.0, 2.0, 4.0)), 2.0) * 2.0 - 1.0;
    vec3 cuboct = cube;
    float i0 = step(0.0, 1.0 - floor(hash / 16.0));
    float i1 = step(0.0, floor(hash / 16.0) - 1.0);
    cuboct.x *= 1.0 - i0;
    cuboct.y *= 1.0 - i1;
    cuboct.z *= 1.0 - (1.0 - i0 - i1);
    float tp = mod(floor(hash / 8.0), 2.0);
    vec3 rhomb = (1.0 - tp) * cube + tp * (cuboct + cross(cube, cuboct));
    vec3 gradient = cuboct * 1.22474487139 + rhomb;
    gradient *= (1.0 - 0.042942436724648037 * tp) * 3.5946317686139184;
    return gradient;
}

vec4 bccHalf(vec3 pos) {
    vec3 base = floor(pos);
    vec4 index4 = vec4(pos - base, 2.5);
    vec3 vertex1 = base + floor(dot(index4, vec4(0.25)));
    vec3 vertex2 = base + vec3(1,0,0) + vec3(-1,1,1) * floor(dot(index4, vec4(-0.25, 0.25, 0.25, 0.35)));
    vec3 vertex3 = base + vec3(0,1,0) + vec3(1,-1,1) * floor(dot(index4, vec4(0.25, -0.25, 0.25, 0.35)));
    vec3 vertex4 = base + vec3(0,0,1) + vec3(1,1,-1) * floor(dot(index4, vec4(0.25, 0.25, -0.25, 0.35)));
    vec4 hsh = permute(mod(vec4(vertex1.x, vertex2.x, vertex3.x, vertex4.x), 289.0));
    hsh = permute(mod(hsh + vec4(vertex1.y, vertex2.y, vertex3.y, vertex4.y), 289.0));
    hsh = mod(permute(mod(hsh + vec4(vertex1.z, vertex2.z, vertex3.z, vertex4.z), 289.0)), 48.0);
    vec3 diff1 = pos - vertex1;
    vec3 diff2 = pos - vertex2;
    vec3 diff3 = pos - vertex3;
    vec3 diff4 = pos - vertex4;
    vec4 falloff = max(0.75 - vec4(dot(diff1, diff1), dot(diff2, diff2), dot(diff3, diff3), dot(diff4, diff4)), 0.0);
    vec4 falloff2 = falloff * falloff;
    vec4 falloff4 = falloff2 * falloff2;
    vec3 grad1 = grad(hsh.x);
    vec3 grad2 = grad(hsh.y);
    vec3 grad3 = grad(hsh.z);
    vec3 grad4 = grad(hsh.w);
    vec4 extrapolation = vec4(dot(diff1, grad1), dot(diff2, grad2), dot(diff3, grad3), dot(diff4, grad4));
    vec3 derivative = -8.0 * mat4x3(diff1, diff2, diff3, diff4) * (falloff2 * falloff * extrapolation)
                    + mat4x3(grad1, grad2, grad3, grad4) * falloff4;
    return vec4(derivative, 0.0);
}

vec4 bccNoise(vec3 pos) {
    mat3 orientation = mat3(
         0.788675134594813, -0.211324865405187, -0.577350269189626,
        -0.211324865405187,  0.788675134594813, -0.577350269189626,
         0.577350269189626,  0.577350269189626,  0.577350269189626);
    pos = orientation * pos;
    return vec4((bccHalf(pos) + bccHalf(pos + 144.5)).xyz * orientation, 0.0);
}

void main() {
    float aspectRatio = uResolution.x / uResolution.y;
    vec2 noiseOrigin = vec2(0.5) + vec2(0.0, 0.36 * uTime * 0.0125 * uSpeed);
    vec2 noiseCoord = (vUv - noiseOrigin) * vec2(aspectRatio, 1.0) * 12.0;
    vec4 noise = bccNoise(vec3(noiseCoord * 0.35, uTime * 0.02 * uSpeed));
    vec2 warpedUv = noise.xy / 7.0 + 0.5;

    vec2 edgeUv = mix(vUv, warpedUv, uEdgeDistortion);
    vec2 ringUv = mix(vUv, warpedUv, uRingDistortion);

    vec4 edgeSample = texture2D(uTexture, edgeUv);
    vec4 ringSample = texture2D(uTexture, ringUv);

    vec3 color = vec3(0.0);
    color += tanhApprox(vec3(edgeSample.r) * uEdgeColor);
    color += tanhApprox(vec3(edgeSample.g) * uEdgeColor);
    color += tanhApprox(vec3(ringSample.b) * uRingColor);

    gl_FragColor = vec4(color, dot(color, vec3(0.299, 0.587, 0.114)));
}`

const blurFrag = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform vec2 uDirection;
uniform float uBlurAmount;

float ease(float t) { return t < 0.5 ? 2.0*t*t : -1.0 + (4.0 - 2.0*t)*t; }

const float weights[36] = float[36](
    .00095,.00152,.00237,.0036,.0053,.00761,
    .01062,.01442,.01903,.02444,.03052,.03707,
    .0438,.05032,.05624,.06113,.06462,.06644,
    .06644,.06462,.06113,.05624,.05032,.0438,
    .03707,.03052,.02444,.01903,.01442,.01062,
    .00761,.0053,.0036,.00237,.00152,.00095
);

void main() {
    float distToCenter = distance(vUv, vec2(0.5));
    float amount = uBlurAmount * 11.0 * ease(mix(distToCenter, max(0.0, 1.0 - distToCenter), 0.5));
    vec2 dir = uDirection;
    if (uDirection.y > 0.0) dir.y *= uResolution.x / uResolution.y;

    vec2 stepSize = vec2(amount * 0.001) * dir * 0.5;

    vec4 color = vec4(0.0);

    for (int i = 0; i < 36; i += 2) {
        float offset1 = float(i - 18);
        float offset2 = float(i + 1 - 18);
        float weight1 = weights[i];
        float weight2 = weights[i + 1];
        float weightSum = weight1 + weight2;
        float mergedOffset = (offset1 * weight1 + offset2 * weight2) / weightSum;
        color += texture2D(uTexture, vUv + stepSize * mergedOffset) * weightSum;
    }

    gl_FragColor = color;
}`

const halftoneFrag = /* glsl */ `
precision highp float;
precision highp int;
varying vec2 vUv;
uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform float uGridSize;

uvec2 pcg2d(uvec2 v) {
    v = v * 1664525u + 1013904223u;
    v.x += v.y * v.y * 1664525u + 1013904223u;
    v.y += v.x * v.x * 1664525u + 1013904223u;
    v ^= v >> 16;
    v.x += v.y * v.y * 1664525u + 1013904223u;
    v.y += v.x * v.x * 1664525u + 1013904223u;
    return v;
}
float randFibo(vec2 p) {
    uvec2 v = floatBitsToUint(p);
    v = pcg2d(v);
    uint r = v.x ^ v.y;
    return float(r) / float(0xffffffffu);
}

void main() {
    float aspectRatio = uResolution.x / uResolution.y;
    float aspectCorrection = mix(aspectRatio, 1.0 / aspectRatio, 0.5);
    float cellCount = 1.0 / uGridSize;

    vec2 cellSize = vec2(1.0 / (cellCount * aspectRatio), 1.0 / cellCount) * aspectCorrection;
    vec2 centeredUv = vUv - 0.5;
    vec2 cellIndex = floor(centeredUv / cellSize);
    vec2 cellCenterUv = (cellIndex + 0.5) * cellSize + 0.5;

    vec4 bgColor = texture2D(uTexture, vUv);
    vec4 cellColor = texture2D(uTexture, cellCenterUv);

    float luminance = dot(cellColor.rgb, vec3(0.2126, 0.7152, 0.0722));

    vec2 localPos = (centeredUv - cellIndex * cellSize) / cellSize * 2.0 - 1.0;
    float distFromCellCenter = max(abs(localPos.x), abs(localPos.y));

    float dotRadius = luminance * 0.88;
    float dotMask = smoothstep(dotRadius + 0.02, dotRadius - 0.02, distFromCellCenter);

    vec3 boostedColor = cellColor.rgb * 1.4;
    vec3 ditheredColor = boostedColor * dotMask;

    cellColor.rgb = mix(bgColor.rgb, ditheredColor, 0.5);
    cellColor.rgb += (randFibo(gl_FragCoord.xy) - 0.5) / 255.0;
    gl_FragColor = cellColor;
}
`

const passthroughFrag = /* glsl */ `
    precision highp float;
    precision highp int;
    uniform sampler2D uTexture;
    varying vec2 vUv;
    uvec2 pcg2d(uvec2 v) {
        v = v * 1664525u + 1013904223u;
        v.x += v.y * v.y * 1664525u + 1013904223u;
        v.y += v.x * v.x * 1664525u + 1013904223u;
        v ^= v >> 16;
        v.x += v.y * v.y * 1664525u + 1013904223u;
        v.y += v.x * v.x * 1664525u + 1013904223u;
        return v;
    }
    float randFibo(vec2 p) {
        uvec2 v = floatBitsToUint(p);
        v = pcg2d(v);
        uint r = v.x ^ v.y;
        return float(r) / float(0xffffffffu);
    }
    void main() {
        vec4 color = texture2D(uTexture, vUv);
        color.rgb += (randFibo(gl_FragCoord.xy) - 0.5) / 255.0;
        gl_FragColor = color;
    }
`

const FBO_SETTINGS = {
    minFilter: LinearFilter,
    magFilter: LinearFilter,
    type: HalfFloatType,
} as const

const DIR_H = new Vector2(1, 0)
const DIR_V = new Vector2(0, 1)

export type HalftoneGlowProps = {
    speed?: number
    blurAmount?: number
    edgeSize?: number
    edgeDistortion?: number
    ringDistortion?: number
    edgeColor?: string
    ringColor?: string
    onTextureReady?: (texture: Texture) => void
}

export function HalftoneGlow({
    speed = 16,
    blurAmount = 0.2,
    edgeSize = 10,
    edgeDistortion = 0.02,
    ringDistortion = 0.1,
    edgeColor = "#1d334e",
    ringColor = "#4599ff",
    onTextureReady = undefined,
}: HalftoneGlowProps) {
    const { size, gl } = useThree()
    const [bufferScene] = useState(() => new Scene())
    const res = useMemo(() => new Vector2(size.width, size.height), [size])
    const edgeCol = useMemo(() => new Color(edgeColor), [edgeColor])
    const ringCol = useMemo(() => new Color(ringColor), [ringColor])
    const bufferCamera = useMemo(() => new OrthographicCamera(-1, 1, 1, -1, 0, 1), [])
    const offMesh = useMemo(() => new Mesh(new PlaneGeometry(2, 2)), [])

    const renderTargetBase = useFBO(
        Math.ceil(size.width / 2),
        Math.ceil(size.height / 2),
        FBO_SETTINGS,
    )
    const renderTargetNoise = useFBO(
        Math.ceil(size.width / 4),
        Math.ceil(size.height / 4),
        FBO_SETTINGS,
    )
    const renderTargetBlurA = useFBO(
        Math.ceil(size.width / 4),
        Math.ceil(size.height / 4),
        FBO_SETTINGS,
    )
    const renderTargetBlurB = useFBO(
        Math.ceil(size.width / 4),
        Math.ceil(size.height / 4),
        FBO_SETTINGS,
    )
    const renderTargetFinal = useFBO(
        onTextureReady ? size.width : 1,
        onTextureReady ? size.height : 1,
        FBO_SETTINGS,
    )

    const materials = useMemo(
        () => ({
            base: new ShaderMaterial({
                vertexShader: vert,
                fragmentShader: baseFrag,
                uniforms: {
                    uTime: { value: 0 },
                    uSpeed: { value: 1 },
                    uEdgeSize: { value: 1 },
                    uResolution: { value: new Vector2() },
                },
            }),
            noise: new ShaderMaterial({
                vertexShader: vert,
                fragmentShader: noiseFrag,
                uniforms: {
                    uTexture: { value: null },
                    uTime: { value: 0 },
                    uSpeed: { value: 1 },
                    uResolution: { value: new Vector2() },
                    uEdgeDistortion: { value: 0.1 },
                    uRingDistortion: { value: 0.1 },
                    uEdgeColor: { value: new Color() },
                    uRingColor: { value: new Color() },
                },
            }),
            blurH: new ShaderMaterial({
                vertexShader: vert,
                fragmentShader: blurFrag,
                uniforms: {
                    uTexture: { value: null },
                    uResolution: { value: new Vector2() },
                    uDirection: { value: DIR_H },
                    uBlurAmount: { value: 0.47 },
                },
            }),
            blurV: new ShaderMaterial({
                vertexShader: vert,
                fragmentShader: blurFrag,
                uniforms: {
                    uTexture: { value: null },
                    uResolution: { value: new Vector2() },
                    uDirection: { value: DIR_V },
                    uBlurAmount: { value: 0.47 },
                },
            }),
            halftone: new ShaderMaterial({
                vertexShader: vert,
                fragmentShader: halftoneFrag,
                uniforms: {
                    uTexture: { value: null },
                    uResolution: { value: new Vector2() },
                    uGridSize: { value: 0.005 },
                },
            }),

            passthrough: new ShaderMaterial({
                vertexShader: vert,
                fragmentShader: passthroughFrag,
                uniforms: {
                    uTexture: { value: null },
                },
            }),
        }),
        [],
    )

    const renderPass = useCallback(
        (mat: ShaderMaterial, target: WebGLRenderTarget | null) => {
            offMesh.material = mat
            gl.setRenderTarget(target)
            gl.render(bufferScene, bufferCamera)
        },
        [bufferScene, bufferCamera, gl, offMesh],
    )

    useEffect(() => {
        if (onTextureReady) {
            onTextureReady(renderTargetFinal.texture)
        }
    }, [onTextureReady, renderTargetFinal])

    useEffect(() => {
        bufferScene.add(offMesh)
        return () => {
            bufferScene.remove(offMesh)
            offMesh.geometry.dispose()
            for (const mat of Object.values(materials)) {
                mat.dispose()
            }
        }
    }, [bufferScene, offMesh, materials])

    useEffect(() => {
        materials.base.uniforms.uSpeed.value = speed
        materials.base.uniforms.uEdgeSize.value = edgeSize
        materials.base.uniforms.uResolution.value = res
        materials.noise.uniforms.uSpeed.value = speed
        materials.noise.uniforms.uResolution.value = res
        materials.noise.uniforms.uEdgeDistortion.value = edgeDistortion
        materials.noise.uniforms.uRingDistortion.value = ringDistortion
        materials.noise.uniforms.uEdgeColor.value = edgeCol
        materials.noise.uniforms.uRingColor.value = ringCol
        materials.blurH.uniforms.uResolution.value = res
        materials.blurH.uniforms.uBlurAmount.value = blurAmount
        materials.blurV.uniforms.uResolution.value = res
        materials.blurV.uniforms.uBlurAmount.value = blurAmount
        materials.halftone.uniforms.uResolution.value = res
    }, [
        speed,
        edgeSize,
        res,
        edgeCol,
        ringCol,
        edgeDistortion,
        ringDistortion,
        blurAmount,
        materials,
    ])

    useFrame(({ clock, scene, camera }) => {
        const time = clock.getElapsedTime()

        materials.base.uniforms.uTime.value = time
        renderPass(materials.base, renderTargetBase)

        materials.noise.uniforms.uTexture.value = renderTargetBase.texture
        materials.noise.uniforms.uTime.value = time
        renderPass(materials.noise, renderTargetNoise)

        materials.blurH.uniforms.uTexture.value = renderTargetNoise.texture
        renderPass(materials.blurH, renderTargetBlurA)

        materials.blurV.uniforms.uTexture.value = renderTargetBlurA.texture
        renderPass(materials.blurV, renderTargetBlurB)

        materials.halftone.uniforms.uTexture.value = renderTargetBlurB.texture
        renderPass(materials.halftone, null)

        if (onTextureReady) {
            renderPass(materials.halftone, renderTargetFinal)
            gl.setRenderTarget(null)
        }

        gl.autoClear = false
        gl.clearDepth()
        gl.render(scene, camera)
        gl.autoClear = true
    }, 1)

    return null
}
