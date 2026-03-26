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
    {
        name: "magnetic-dot-grid",
        files: ["magnetic-dot-grid.tsx"],
        description: "Magnetic dot grid effect",
        dependencies: [],
    },
    {
        name: "halftone-glow",
        files: ["halftone-glow.tsx"],
        description: "Half tone glow effect",
        dependencies: ["three", "@react-three/fiber", "@react-three/drei"],
    },
    {
        name: "pixelated-text",
        files: ["pixelated-text.tsx"],
        description: "Pixelated text effect",
        dependencies: [],
    },
]
