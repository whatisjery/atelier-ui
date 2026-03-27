import { lazy } from "react"

export const demos: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
    "fluid-distortion-demo": lazy(() => import("./fluid-distortion-demo/fluid-distortion-demo")),
    "pixel-trail-demo": lazy(() => import("./pixel-trail-demo/pixel-trail-demo")),
    "magnetic-dot-grid-demo": lazy(() => import("./magnetic-dot-grid-demo/magnetic-dot-grid-demo")),
    "halftone-glow-demo": lazy(() => import("./halftone-glow-demo/halftone-glow-demo")),
    "pixelated-text-demo": lazy(() => import("./pixelated-text-demo/pixelated-text-demo")),
    "image-trail-demo": lazy(() => import("./image-trail-demo/image-trail-demo")),
}
