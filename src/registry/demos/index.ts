import { lazy } from "react"

export const demos: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
    "fluid-distortion": lazy(() => import("./fluid-distortion/fluid-distortion")),
    "pixel-trail": lazy(() => import("./pixel-trail/pixel-trail")),
    "magnetic-dot-grid": lazy(() => import("./magnetic-dot-grid/magnetic-dot-grid")),
    "pixelated-text": lazy(() => import("./pixelated-text/pixelated-text")),
    "image-trail": lazy(() => import("./image-trail/image-trail")),
    "infinite-gallery": lazy(() => import("./infinite-gallery/infinite-gallery")),
    "text-scramble": lazy(() => import("./text-scramble/text-scramble")),
    "liquid-media": lazy(() => import("./liquid-media/liquid-media")),
    "infinite-parallax": lazy(() => import("./infinite-parallax/infinite-parallax")),
    "infinite-zoom": lazy(() => import("./infinite-zoom/infinite-zoom")),
    "scattered-scroll": lazy(() => import("./scattered-scroll/scattered-scroll")),
    "text-bounce": lazy(() => import("./text-bounce/text-bounce")),
    "curve-media": lazy(() => import("./curve-media/curve-media")),
    "text-fluid": lazy(() => import("./text-fluid/text-fluid")),
    "lens-media": lazy(() => import("./lens-media/lens-media")),
    "pixel-media": lazy(() => import("./pixel-media/pixel-media")),
    "sphere-gallery": lazy(() => import("./sphere-gallery/sphere-gallery")),
    "spiral-gallery": lazy(() => import("./spiral-gallery/spiral-gallery")),
    "pixel-scroll": lazy(() => import("./pixel-scroll/pixel-scroll")),
    "orbit-gallery": lazy(() => import("./orbit-gallery/orbit-gallery")),
    "edge-bounce": lazy(() => import("./edge-bounce/edge-bounce")),
}

/*
 * Demos that need page-level smooth scrolling even though they are not
 * registry components with a smooth-scroll dependency (showcase entries).
 */
export const scrollDemos: string[] = []
