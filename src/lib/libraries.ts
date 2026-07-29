export type Library = {
    title: string
    url: string
    description: string
}

export const libraries: Record<string, Library> = {
    "@react-three/fiber": {
        title: "React Three Fiber",
        url: "https://r3f.docs.pmnd.rs/",
        description: "React renderer for Three.js.",
    },
    motion: {
        title: "Motion",
        url: "https://motion.dev",
        description: "React animation library.",
    },
}
