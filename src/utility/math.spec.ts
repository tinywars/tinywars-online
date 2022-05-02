import { expect } from "chai";
import { CircleCollider } from "./circle-collider";
import * as GameMath from "./math";
import { Vector } from "./vector";

describe("GameMath", () => {
    describe("clamp", () => {
        it("returns min if value is smaller", () => {
            expect(GameMath.clamp(-1, 0, 1)).to.equal(0);
        });

        it("returns value if it is within bounds", () => {
            expect(GameMath.clamp(0.5, 0, 1)).to.equal(0.5);
        });

        it("returns max if value is greater", () => {
            expect(GameMath.clamp(2, 0, 1)).to.equal(1);
        });
    });

    describe("lerp", () => {
        it ("returns lower bound if t = 0", () => {
            expect(GameMath.lerp(-1, 1, 0)).to.equal(-1);
        });

        it ("interpolates correctly for t € (0, 1)", () => {
            expect(GameMath.lerp(0, 4, 0.25)).to.equal(1);
            expect(GameMath.lerp(0, 4, 0.5)).to.equal(2);
            expect(GameMath.lerp(0, 4, 0.75)).to.equal(3);
        });

        it ("returns upper bound if t = 1", () => {
            expect(GameMath.lerp(-1, 1, 1)).to.equal(1);
        });
    });

    describe("getTimeBeforeCollision", () => {
        it ("Returns undefined if objects on parallel course, far away from each other", () => {
            const colliderA = new CircleCollider(new Vector(0, 0), 1);
            const colliderB = new CircleCollider(new Vector(3, 0), 1);
            const forwardA = new Vector(0, 1);
            const forwardB = new Vector(0, 2);

            expect(GameMath.getTimeBeforeCollision(
                colliderA, 
                colliderB, 
                forwardA, 
                forwardB)).to.be.undefined;
        });

        it ("Returns undefined if objects are not moving", () => {
            const colliderA = new CircleCollider(new Vector(0, 0), 1);
            const colliderB = new CircleCollider(new Vector(3, 0), 1);

            expect(GameMath.getTimeBeforeCollision(
                colliderA, 
                colliderB, 
                Vector.zero(), 
                Vector.zero())).to.be.undefined;
        });

        it ("Returns positive number if objects on parallel course, but close enough", () => {
            const colliderA = new CircleCollider(new Vector(0, 10), 2);
            const colliderB = new CircleCollider(new Vector(1, 0), 2);
            const forwardA = new Vector(0, 1);
            const forwardB = new Vector(0, 8);

            expect(GameMath.getTimeBeforeCollision(
                colliderA, 
                colliderB, 
                forwardA, 
                forwardB)).to.be.approximately(0.875, 0.01);
        });

        it ("Returns positive number if objects are on imminent crash course", () => {
            const colliderA = new CircleCollider(new Vector(0, 0), 2);
            const colliderB = new CircleCollider(new Vector(4, 1), 2);
            const forwardA = new Vector(3, 2);
            const forwardB = new Vector(-1, 1);

            expect(GameMath.getTimeBeforeCollision(
                colliderA, 
                colliderB, 
                forwardA, 
                forwardB)).to.be.approximately(0.0298, 0.0001);
        });

        it ("Returns undefined, if objects collided in the past (moving from each other)", () => {
            const colliderA = new CircleCollider(new Vector(0, 0), 2);
            const colliderB = new CircleCollider(new Vector(4, 1), 2);
            const forwardA = new Vector(-3, -2);
            const forwardB = new Vector(1, -1);

            expect(GameMath.getTimeBeforeCollision(
                colliderA, 
                colliderB, 
                forwardA, 
                forwardB)).to.be.undefined;
        });
    });

    describe("sanitizeAngle", () => {
        it ("Preserves angle from interval <0, 360)", () => {
            expect(GameMath.sanitizeAngle(0)).to.equal(0);
            expect(GameMath.sanitizeAngle(128)).to.equal(128);
            expect(GameMath.sanitizeAngle(359)).to.equal(359);
        });

        it ("Restore angle out of bounds", () => {
            expect(GameMath.sanitizeAngle(-300)).to.equal(60);
            expect(GameMath.sanitizeAngle(-400)).to.equal(320);
            expect(GameMath.sanitizeAngle(360)).to.equal(0);
            expect(GameMath.sanitizeAngle(721)).to.equal(1);
        });
    });
});