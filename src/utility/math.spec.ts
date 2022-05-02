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

    describe("isCrashImminent", () => {
        it ("Returns false if objects on parallel course, far away from each other", () => {
            const colliderA = new CircleCollider(new Vector(0, 0), 1);
            const colliderB = new CircleCollider(new Vector(3, 0), 1);
            const forwardA = new Vector(0, 1);
            const forwardB = new Vector(0, 2);

            expect(GameMath.isCrashImminent(
                colliderA, 
                colliderB, 
                forwardA, 
                forwardB)).to.be.false;
        });

        it ("Returns false if objects are not moving", () => {
            const colliderA = new CircleCollider(new Vector(0, 0), 1);
            const colliderB = new CircleCollider(new Vector(3, 0), 1);

            expect(GameMath.isCrashImminent(
                colliderA, 
                colliderB, 
                Vector.zero(), 
                Vector.zero())).to.be.false;
        });

        it ("Returns true if objects on parallel course, but close enough", () => {
            const colliderA = new CircleCollider(new Vector(0, 10), 2);
            const colliderB = new CircleCollider(new Vector(1, 0), 2);
            const forwardA = new Vector(0, 1);
            const forwardB = new Vector(0, 8);

            expect(GameMath.isCrashImminent(
                colliderA, 
                colliderB, 
                forwardA, 
                forwardB)).to.be.true;
        });

        it ("Returns true if objects are on imminent crash course", () => {
            const colliderA = new CircleCollider(new Vector(0, 0), 2);
            const colliderB = new CircleCollider(new Vector(4, 1), 2);
            const forwardA = new Vector(3, 2);
            const forwardB = new Vector(-1, 1);

            expect(GameMath.isCrashImminent(
                colliderA, 
                colliderB, 
                forwardA, 
                forwardB)).to.be.true;
        });

        it ("Returns false, if objects collided in the past (moving from each other)", () => {
            const colliderA = new CircleCollider(new Vector(0, 0), 2);
            const colliderB = new CircleCollider(new Vector(4, 1), 2);
            const forwardA = new Vector(-3, -2);
            const forwardB = new Vector(1, -1);

            expect(GameMath.isCrashImminent(
                colliderA, 
                colliderB, 
                forwardA, 
                forwardB)).to.be.false;
        });

        it ("Returns false if the crash is not imminent", () => {
            // Objects are running parallel, close enough to collide, but that would
            // happen in more than 2 seconds
            const colliderA = new CircleCollider(new Vector(0, 10), 2);
            const colliderB = new CircleCollider(new Vector(1, 0), 2);
            const forwardA = new Vector(0, 1);
            const forwardB = new Vector(0, 4);

            expect(GameMath.isCrashImminent(
                colliderA, 
                colliderB, 
                forwardA, 
                forwardB, 2)).to.be.false;
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