import { Vector } from "./vector";

export class CircleCollider {
    constructor(private position: Vector, readonly radius: number) {}

    move(direction: Vector) {
        this.position.add(direction);
    }

    setPosition(position: Vector) {
        this.position = position;
    }

    getPosition(): Vector {
        return this.position;
    }

    collidesWith(collider: CircleCollider): boolean {
        return (
            Vector.diff(this.position, collider.position).getSize() <=
            this.radius + collider.radius
        );
    }
}
