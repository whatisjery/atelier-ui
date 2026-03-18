type TRegistryComponent = {
    name: string
    description: string
    dependencies: string[]
    files: string[]
}

export const components: TRegistryComponent[] = [
    {
        name: "fluid-distortion",
        files: ["fluid-distortion.tsx"],
        description: "WebGL fluid distortion cursor effect",
        dependencies: [
            "three",
            "@react-three/fiber",
            "@react-three/drei",
            "@react-three/postprocessing",
        ],
    },
    {
        name: "pixel-trail",
        files: ["pixel-trail.tsx"],
        description: "Pixel trail effect",
        dependencies: [],
    },
]
