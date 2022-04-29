import { Vector } from "./vector";

export class CircleCollider {
    constructor(private position: Vector, private radius: number) {}

    move(direction: Vector) {
        this.position.add(direction);
    }

    setPosition(position: Vector) {
        this.position = position;
    }

    getPosition(): Vector {
        return this.position;
    }

    setRadius(r: number) {
        this.radius = r;
    }

    collidesWith(collider: CircleCollider): boolean {
        return Vector.diff(this.position, collider.position).getSize() <= (this.radius + collider.radius);
    }
}