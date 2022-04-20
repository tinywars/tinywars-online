/**
 * Clamp value between given min and max values
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(value, max));
}

/**
 * Perform linear interpolation of numbers a and b by given factor t
 * @param a Starting point
 * @param b Destination point
 * @param t Factor
 * @returns Interpolated value
 */
export function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}