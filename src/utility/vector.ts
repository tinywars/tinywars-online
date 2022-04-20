/*
Example usage 1: I want to accelerate object, clamp its speed to given maximum, then update position
    forward = forward.add(acceleration.scale(dt));
    const currentSpeed = clamp(forward.size(), 0, MAX_SPEED);
    forward = forward.toUnit().scale(currentSpeed);
    position = position.add(forward.scale(dt));

Example usage 2: I want to get direction from point A to point B:
    const direction = Vector.diff(B, A).toUnit();
*/

export class Vector {
    constructor(public x: number, public y: number) {
    }

    /**
     * Get directional vector between two points
     * @param to Destination point
     * @param from Source point
     * @returns Vector direction
     */
    static diff(to: Vector, from: Vector): Vector {
        return to.add(from.invert());
    }

    copy(): Vector {
        return new Vector(this.x, this.y);
    }

    /**
     * @returns Size of the vector
     */
    size(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    /**
     * Scale this vector by given factor
     * @param factor Factor to scale by
     * @returns Scaled copy of the vector
     */
    scale(factor: number): Vector {
        const r = this.copy();
        r.x *= factor;
        r.y *= factor;
        return r;
    }

    /**
     * Add another vector to this vector
     * @param vec Other vector to add
     * @returns Sum of two vectors
     */
    add(vec: Vector): Vector {
        const r = this.copy();
        r.x += vec.x;
        r.y += vec.y;
        return r;
    }

    /**
     * Invert both components of a vector
     * @param vec 
     */
    invert(): Vector {
        const v = this.copy();
        v.x *= -1;
        v.y *= -1;
        return v;
    }

    toUnit(): Vector {
        if (this.x === 0 && this.y === 0)
            return this.copy();
        return this.scale(1 / this.size());
    }

    toString(): string {
        return "[" + this.x + ", " + this.y + "]";
    }
}