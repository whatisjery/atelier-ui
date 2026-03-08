export function easeInOut(t: number): number {
    return t * t * (3 - 2 * t)
}

export function expoInOut(t: number): number {
    if (t === 0 || t === 1) return t
    return t < 0.5 ? 2 ** (20 * t - 10) / 2 : (2 - 2 ** (-20 * t + 10)) / 2
}

export function power4InOut(t: number): number {
    return t < 0.5 ? 8 * t * t * t * t : 1 - (-2 * t + 2) ** 4 / 2
}

export function expoIn(t: number): number {
    return t === 0 ? 0 : 2 ** (10 * t - 10)
}

export function expoOut(t: number): number {
    return t === 1 ? 1 : 1 - 2 ** (-10 * t)
}
