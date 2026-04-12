type TRegistryComponent = {
    name: string
    description: string
    shared: string[]
    dependencies: string[]
    files: string[]
    pro?: boolean
}

export const components: TRegistryComponent[] = [
    {
        name: "fluid-distortion",
        files: ["fluid-distortion.tsx"],
        description: "WebGL fluid distortion cursor effect",
        shared: [],
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
        shared: ["hooks/use-frame-loop.ts"],
        dependencies: [],
    },
    {
        name: "magnetic-dot-grid",
        files: ["magnetic-dot-grid.tsx"],
        description: "Magnetic dot grid effect",
        shared: ["hooks/use-frame-loop.ts"],
        dependencies: [],
    },
    {
        name: "halftone-glow",
        files: ["halftone-glow.tsx"],
        description: "Half tone glow effect",
        shared: [],
        dependencies: ["three", "@react-three/fiber", "@react-three/drei"],
        pro: true,
    },
    {
        name: "pixelated-text",
        files: ["pixelated-text.tsx"],
        description: "Pixelated text effect",
        shared: ["hooks/use-frame-loop.ts"],
        dependencies: [],
    },
    {
        name: "image-trail",
        files: ["image-trail.tsx"],
        description: "Image trail effect",
        shared: [],
        dependencies: ["motion"],
    },
    {
        name: "infinite-gallery",
        files: ["infinite-gallery.tsx"],
        description: "Infinite gallery effect",
        shared: ["hooks/use-frame-loop.ts"],
        dependencies: [],
    },
    {
        name: "simple-scramble",
        files: ["simple-scramble.tsx"],
        description: "Simple scramble effect",
        shared: ["hooks/use-frame-loop.ts"],
        dependencies: [],
    },
    {
        name: "liquid-touch",
        files: ["liquid-touch.tsx"],
        description: "Liquid touch effect",
        shared: ["assets/ripple.png"],
        dependencies: ["three", "@react-three/fiber", "@react-three/drei"],
    },
    {
        name: "infinite-parallax",
        files: ["infinite-parallax.tsx"],
        description: "Infinite parallax effect",
        shared: [],
        dependencies: ["motion"],
    },
]
