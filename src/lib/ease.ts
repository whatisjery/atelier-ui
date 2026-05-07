export function expoInOut(t: number): number {
    if (t === 0 || t === 1) return t
    return t < 0.5 ? 2 ** (20 * t - 10) / 2 : (2 - 2 ** (-20 * t + 10)) / 2
}

export function expoOut(t: number): number {
    return t === 1 ? 1 : 1 - 2 ** (-10 * t)
}
