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
    public x: number;
    public y: number;

    constructor(size: number);
    constructor(x: number, y: number);
    constructor(x: number, maybeY?: number) {
        this.x = x;
        this.y = maybeY ?? x;
    }

    /**
     * Get directional vector between two points
     * @param to Destination point
     * @param from Source point
     * @returns Vector direction
     */
    static diff(to: Vector, from: Vector): Vector {
        return to.getSum(from.getInverted());
    }

    static zero(): Vector {
        return new Vector(0, 0);
    }

    static outOfView(): Vector {
        return new Vector(-100, -100);
    }

    static fromPolar(angle: number, size: number) {
        const rad = (angle * Math.PI) / 180;
        return new Vector(Math.cos(rad) * size, Math.sin(rad) * size);
    }

    copy(): Vector {
        return new Vector(this.x, this.y);
    }

    /**
     * @returns Size of the vector
     */
    getSize(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    /**
     * Scale this vector by given factor
     * @param factor Factor to scale by
     * @returns Scaled copy of the vector
     */
    getScaled(factor: number): Vector {
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
    getSum(vec: Vector): Vector {
        const r = this.copy();
        r.add(vec);
        return r;
    }

    add(vec: Vector) {
        this.x += vec.x;
        this.y += vec.y;
    }

    /**
     * Invert both components of a vector
     * @param vec
     */
    getInverted(): Vector {
        const v = this.copy();
        v.x *= -1;
        v.y *= -1;
        return v;
    }

    /**
     * Rotate vector by given angle
     * @param angle Angle in degrees, 0° is at 12 o'clock, incrementing clock-wise
     */
    rotate(angle: number) {
        this.setRotation(this.toAngle() + angle);
    }

    setRotation(angle: number) {
        const size = this.getSize();
        const rad = (angle * Math.PI) / 180;
        this.x = Math.cos(rad) * size;
        this.y = Math.sin(rad) * size;
    }

    limit(maxSize: number) {
        const size = this.getSize();
        if (size > maxSize) {
            this.x *= maxSize / size;
            this.y *= maxSize / size;
        }
    }

    getUnit(): Vector {
        if (this.isZero()) return this.copy();
        return this.getScaled(1 / this.getSize());
    }

    isZero(): boolean {
        return this.x === 0 && this.y === 0;
    }

    toString(): string {
        return "[" + this.x + ", " + this.y + "]";
    }

    toAngle(): number {
        if (this.x === 0 && this.y < 0) return 270;
        else if (this.x === 0 && this.y >= 0) return 90;
        else if (this.y === 0 && this.x < 0) return 180;
        else if (this.y === 0 && this.x >= 0) return 0;
        return (Math.atan2(this.y, this.x) * 180) / Math.PI;
    }
}
