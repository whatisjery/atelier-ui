import { controls as curveMediaControls } from "./curve-media/controls"
import { controls as edgeBounceControls } from "./edge-bounce/controls"
import { controls as fluidDistortionControls } from "./fluid-distortion/controls"
import { controls as imageTrailControls } from "./image-trail/controls"
import { controls as infiniteGalleryControls } from "./infinite-gallery/controls"
import { controls as infiniteParallaxControls } from "./infinite-parallax/controls"
import { controls as infiniteZoomControls } from "./infinite-zoom/controls"
import { controls as lensMediaControls } from "./lens-media/controls"
import { controls as liquidMediaControls } from "./liquid-media/controls"
import { controls as magneticDotGridControls } from "./magnetic-dot-grid/controls"
import { controls as orbitGalleryControls } from "./orbit-gallery/controls"
import { controls as pixelMediaControls } from "./pixel-media/controls"
import { controls as pixelScrollControls } from "./pixel-scroll/controls"
import { controls as pixelTrailControls } from "./pixel-trail/controls"
import { controls as pixelatedTextControls } from "./pixelated-text/controls"
import { controls as sphereGalleryControls } from "./sphere-gallery/controls"
import { controls as spiralGalleryControls } from "./spiral-gallery/controls"
import { controls as textBounceControls } from "./text-bounce/controls"
import { controls as textFluidControls } from "./text-fluid/controls"
import { controls as textScrambleControls } from "./text-scramble/controls"
import type { ControlDef } from "@/types/controls"

export const demoControls: Record<string, Record<string, ControlDef>> = {
    "curve-media": curveMediaControls,
    "edge-bounce": edgeBounceControls,
    "fluid-distortion": fluidDistortionControls,
    "image-trail": imageTrailControls,
    "infinite-gallery": infiniteGalleryControls,
    "infinite-parallax": infiniteParallaxControls,
    "infinite-zoom": infiniteZoomControls,
    "lens-media": lensMediaControls,
    "liquid-media": liquidMediaControls,
    "magnetic-dot-grid": magneticDotGridControls,
    "orbit-gallery": orbitGalleryControls,
    "pixel-media": pixelMediaControls,
    "pixel-scroll": pixelScrollControls,
    "pixel-trail": pixelTrailControls,
    "pixelated-text": pixelatedTextControls,
    "sphere-gallery": sphereGalleryControls,
    "spiral-gallery": spiralGalleryControls,
    "text-bounce": textBounceControls,
    "text-fluid": textFluidControls,
    "text-scramble": textScrambleControls,
}
