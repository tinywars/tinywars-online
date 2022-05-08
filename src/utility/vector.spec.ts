import { expect } from "chai";
import { Vector } from "./vector";

describe("Vector", () => {
    describe("Utility functions", () => {
        const v1 = new Vector(-10, -55);
        const v2 = new Vector(10, 20);
        const v3 = new Vector(20, -15);
        const v4 = new Vector(-13, 12);
        const zeroV = Vector.zero();

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
        const v1 = new Vector(0, -1);
        const v2 = new Vector(1, 1);
        const v3 = new Vector(1, 0);
        const v4 = new Vector(-1, 1);

        it("correctly computes angle", () => {
            expect(v1.toAngle()).to.equal(270);
            expect(v2.toAngle()).to.equal(45);
            expect(v3.toAngle()).to.equal(0);
            expect(v4.toAngle()).to.equal(135);
        });

        it("correctly sets rotation", () => {
            const vecSize = Math.sqrt(2);
            const r = v3.getScaled(vecSize);
            expect(r.toAngle()).to.be.approximately(0, 0.01);

            r.setRotation(45);
            expect(r.toAngle()).to.be.approximately(45, 0.01);

            expect(r.getSize()).to.be.approximately(vecSize, 0.01);
            expect(r.x).to.be.approximately(1, 0.01);
            expect(r.y).to.be.approximately(1, 0.01);
        });

        it("correctly rotates vector", () => {
            const vecSize = Math.sqrt(2);
            const r = v3.getScaled(vecSize);
            expect(r.toAngle()).to.be.approximately(0, 0.01);

            r.rotate(45);
            expect(r.toAngle()).to.be.approximately(45, 0.01);

            expect(r.x).to.be.approximately(1, 0.01);
            expect(r.y).to.be.approximately(1, 0.01);
        });
    });

    describe("General math", () => {
        const v1 = new Vector(-10, -55);
        const origSize = v1.getSize();

        it("scales properly", () => {
            expect(v1.getScaled(0.5).getSize()).to.be.approximately(
                origSize * 0.5,
                0.01,
            );
            expect(v1.getScaled(1.3).getSize()).to.be.approximately(
                origSize * 1.3,
                0.01,
            );
        });

        it("can be limited to maximum size", () => {
            v1.limit(10);
            expect(v1.getSize()).to.be.approximately(10, 0.001);
        });
    });

    [new Vector(-266, 583), new Vector(1, 1), new Vector(0, -10)].forEach(
        (v) => {
            it(`Correctly constructs from polar coordinates |${v.toString()}| = ${v.getSize()}, alfa = ${v.toAngle()}`, () => {
                const v2 = Vector.fromPolar(v.toAngle(), v.getSize());
                expect(v2.x).to.be.approximately(v.x, 0.001);
                expect(v2.y).to.be.approximately(v.y, 0.001);
            });
        },
    );
});
