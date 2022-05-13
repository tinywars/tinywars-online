import { assert } from "chai";
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
): number | null {
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
    return rem < 0 ? rem + 360 : rem;
}

export function radialDifference(alfa: number, beta: number): number {
    return Math.min(
        Math.abs(alfa - beta),
        Math.min(alfa, beta) + 360 - Math.max(alfa, beta),
    );
}

/**
 * This method basically computes "where should I aim to hit a target moving at given speed when
 * projectiles have that speed".
 * @param pointOrigin Where target currently sits at
 * @param pointForward Target forward vector
 * @param circleOrigin Player position
 * @param circleGrowSpeed Speed of the projectile
 * @returns Vector if such point exists (from the game standpoint that should be always) or null
 * if there is none.
 */
export function getIntersectionBetweenMovingPointAndGrowingCircle(
    pointOrigin: Vector,
    pointForward: Vector,
    circleOrigin: Vector,
    circleGrowSpeed: number,
): Vector | null {
    const X = pointOrigin.x - circleOrigin.x;
    const Y = pointOrigin.y - circleOrigin.y;
    const A =
        pointForward.x * pointForward.x +
        pointForward.y * pointForward.y -
        circleGrowSpeed * circleGrowSpeed;
    const B = 2 * (X * pointForward.x + Y * pointForward.y);
    const C = X * X + Y * Y;
    const D = B * B - 4 * A * C;

    // If point is moving perpendicular to circle and at a higher speed
    if (D < 0) return null;

    const t = (-B - Math.sqrt(D)) / (2 * A);

    // If point is moving from circle at a higher speed
    if (t < 0) return null;

    return pointOrigin.getSum(pointForward.getScaled(t));
}
