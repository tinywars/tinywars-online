import { expect } from "chai";
import { CircleCollider } from "./circle-collider";
import { Vector } from "./vector";

describe("CircleCollider", () => {
    let collider1: CircleCollider;
    let collider2: CircleCollider;

    beforeEach(() => {
        collider1 = new CircleCollider(new Vector(10, 10), 16);
        collider2 = new CircleCollider(new Vector(20, 20), 10);
    });

    describe("collidesWith", () => {
        it("Collides with other collider is close enough", () => {
            expect(collider1.collidesWith(collider2)).to.be.true;
        });

        it("Does not collide with far away collider", () => {
            collider2.move(new Vector(20, 20)); // new position is (40, 40)
            expect(collider1.collidesWith(collider2)).to.be.false;
        });
    });

    it("Correctly sets/gets position", () => {
        collider1.setPosition(new Vector(10, 20));
        expect(collider1.getPosition().x).to.equal(10);
        expect(collider1.getPosition().y).to.equal(20);
    });
});
