import { CircleCollider } from "./circle-collider";
import { Vector } from "./vector";

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

/**
 * Computes whether two objects are on a crash course and
 * in how many seconds will they collide.
 * @param colliderA Collider for first object
 * @param colliderB Collider for second object
 * @param forwardA Forward vector of first object
 * @param forwardB Forward vector of second object
 * @returns Returns time in seconds when collision will occur or
 * null if no collision can occur.
 */
export function getTimeBeforeCollision(
    colliderA: CircleCollider, 
    colliderB: CircleCollider, 
    forwardA: Vector, 
    forwardB: Vector, 
) : number | null {
    /**
     * Following equatations works on following basis:
     * There is a parameter t (time) such:
     * A = positionA + t * forwardA
     * B = positionB + t * forwardB
     * |A - B| < radiusA + radius
     * 
     * Meaning that we are testing whether there is a time offset
     * under which to points driven by their forward forces
     * will become close enough that they collide.
     * 
     * This boils down to quadratic equatation.
     * Now if both forward vectors are 0 then no collision can occur.
     * Second, if discriminant is < 0 then no crash course exists.
     * Discriminant of 0 means both objects will touch.
     * Discriminant > 0 will yield two values: t1 and t2.
     * They denote the interval under which two objects are actively colliding.
     * If t1 < 0 then we would have to invert both forward to get into collision
     * so nothing is threathening us.
     * If t1 > 0 then collision will happen in t1 seconds.
     * t2 does not interest us at all because we need to know starting point of 
     * collision, not ending point.
     */
    const X = colliderA.getPosition().x - colliderB.getPosition().x;
    const Y = colliderA.getPosition().y - colliderB.getPosition().y;
    const R = colliderA.radius + colliderB.radius;
    const Fx = forwardA.x - forwardB.x;
    const Fy = forwardA.y - forwardB.y;
    const F = Fx * Fx + Fy * Fy;
    const TwoFxy = 2 * Fx * X + 2 * Fy * Y;
    const C = X * X + Y * Y - R * R;

    if (F === 0) return null; // nobody is actually moving

    const discriminant = TwoFxy * TwoFxy - 4 * F * C;
    if (discriminant < 0) return null; // quadratic has no solution, no crash course

    const t1 = (-TwoFxy - Math.sqrt(discriminant)) / (2 * F);

    return t1 >= 0 ? t1 : null;
}

export function sanitizeAngle(angle: number): number {
    const rem = angle % 360;
    return rem < 0 ? (rem + 360): rem;
}