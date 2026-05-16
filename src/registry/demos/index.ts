import { lazy } from "react"

export const demos: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
    "fluid-distortion": lazy(() => import("./fluid-distortion/fluid-distortion")),
    "pixel-trail": lazy(() => import("./pixel-trail/pixel-trail")),
    "magnetic-dot-grid": lazy(() => import("./magnetic-dot-grid/magnetic-dot-grid")),
    "halftone-glow": lazy(() => import("./halftone-glow/halftone-glow")),
    "pixelated-text": lazy(() => import("./pixelated-text/pixelated-text")),
    "image-trail": lazy(() => import("./image-trail/image-trail")),
    "infinite-gallery": lazy(() => import("./infinite-gallery/infinite-gallery")),
    "simple-scramble": lazy(() => import("./simple-scramble/simple-scramble")),
    "liquid-image": lazy(() => import("./liquid-image/liquid-image")),
    "infinite-parallax": lazy(() => import("./infinite-parallax/infinite-parallax")),
    "elastic-stick": lazy(() => import("./elastic-stick/elastic-stick")),
    "glowing-fog": lazy(() => import("./glowing-fog/glowing-fog")),
    "infinite-zoom": lazy(() => import("./infinite-zoom/infinite-zoom")),
    "scattered-scroll": lazy(() => import("./scattered-scroll/scattered-scroll")),
    "text-roll": lazy(() => import("./text-roll/text-roll")),
    "text-bounce": lazy(() => import("./text-bounce/text-bounce")),
    "dither-flow": lazy(() => import("./dither-flow/dither-flow")),
    "curve-image": lazy(() => import("./curve-image/curve-image")),
}
