type TRegistryComponent = {
    name: string
    description: string
    dependencies: string[]
    files: string[]
}

export const components: TRegistryComponent[] = [
    {
        name: "fluid-cursor",
        files: ["fluid-cursor.tsx"],
        description: "WebGL fluid distortion cursor effect",
        dependencies: [
            "three",
            "@react-three/fiber",
            "@react-three/drei",
            "@react-three/postprocessing",
        ],
    },
]
