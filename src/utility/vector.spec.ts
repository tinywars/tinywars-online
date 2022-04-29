import { expect } from "chai";
import { Vector } from "./vector";

describe("Vector", () => {
    const v1 = new Vector(-10, -55);
    const v2 = new Vector(10, 20);
    const v3 = new Vector(20, -15);
    const v4 = new Vector(-13, 12);
    const zeroV = new Vector(0, 0); // todo: Vector.zero()

    describe("Utility functions", () => {
        it("Correctly tests zero vector", () => {
            expect(v1.isZero()).to.be.false;
            expect(zeroV.isZero()).to.be.true;
        });

        it("correctly produces unit vector", () => {
            expect(v1.getUnit().getSize()).to.be.approximately(1, 0.001);
            expect(v2.getUnit().getSize()).to.be.approximately(1, 0.001);
            expect(v3.getUnit().getSize()).to.be.approximately(1, 0.001);
            expect(v4.getUnit().getSize()).to.be.approximately(1, 0.001);
            expect(zeroV.getUnit().getSize()).to.equal(0);
        });

        it("Correctly formats string", () => {
            expect(v1.toString()).to.equal("[-10, -55]");
            expect(zeroV.toString()).to.equal("[0, 0]");
        });
    });

    describe("Rotations and angles", () => {
        // TODO: this
    });

    describe("General math", () => {
        it("scales properly", () => {
            // TODO: this
        });

        // TODO: lot of stuff is waiting for projectiles
    });
});