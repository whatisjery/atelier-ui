import type { BufferAttribute, InterleavedBufferAttribute } from "three"

export type ObjectFitCrop = {
    repeatU: number
    repeatV: number
    fitScaleX: number
    fitScaleY: number
}

/**
 * Replicates CSS object-fit on a WebGL plane: cover crops via UV repeat,
 * contain shrinks the mesh scale (UVs alone can't letterbox).
 *
 * Returns the neutral crop while the media aspect is unknown (e.g. a video
 * before its metadata loads reports 0x0).
 */
export function computeObjectFit(
    planeAspect: number,
    mediaAspect: number,
    objectFit: string,
): ObjectFitCrop {
    const crop: ObjectFitCrop = { repeatU: 1, repeatV: 1, fitScaleX: 1, fitScaleY: 1 }
    if (!Number.isFinite(mediaAspect) || mediaAspect <= 0) return crop

    if (objectFit === "cover") {
        if (planeAspect > mediaAspect) {
            crop.repeatV = mediaAspect / planeAspect
        } else {
            crop.repeatU = planeAspect / mediaAspect
        }
    } else if (objectFit === "contain") {
        if (planeAspect > mediaAspect) {
            crop.fitScaleX = mediaAspect / planeAspect
        } else {
            crop.fitScaleY = planeAspect / mediaAspect
        }
    }

    return crop
}

/** Rewrites a plane's UV grid so the texture samples the cropped region. */
export function applyUvCrop(
    uvAttribute: BufferAttribute | InterleavedBufferAttribute,
    segments: number,
    repeatU: number,
    repeatV: number,
) {
    const offsetU = (1 - repeatU) / 2
    const offsetV = (1 - repeatV) / 2

    for (let iy = 0; iy <= segments; iy++) {
        for (let ix = 0; ix <= segments; ix++) {
            const index = iy * (segments + 1) + ix
            const u = ix / segments
            const v = 1 - iy / segments
            uvAttribute.setXY(index, u * repeatU + offsetU, v * repeatV + offsetV)
        }
    }

    uvAttribute.needsUpdate = true
}
