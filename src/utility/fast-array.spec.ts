import { expect } from "chai";
import { FastArray } from "./fast-array";

class A {
    constructor(public value: number) {}
}

describe("FastArray", () => {
    const capacity = 5;
    let fa: FastArray<A>;

    beforeEach(() => {
        fa = new FastArray(capacity, () => new A(0));
    });

    describe("constructor", () => {
        it("is empty on init", () => {
            expect(fa.getSize()).to.equal(0);
        });

        it("has correct capacity", () => {
            expect(fa.getCapacity()).to.equal(5);
        });
    });

    describe("#grow", () => {
        it("increases size", () => {
            expect(fa.grow()).to.be.true;
            expect(fa.getSize()).to.equal(1);
            expect(fa.grow()).to.be.true;
            expect(fa.getSize()).to.equal(2);
        });

        it("cannot grow past capacity", () => {
            expect(fa.grow()).to.be.true;
            expect(fa.grow()).to.be.true;
            expect(fa.grow()).to.be.true;
            expect(fa.grow()).to.be.true;
            expect(fa.grow()).to.be.true;
            expect(fa.grow()).to.not.be.true;
        });
    });

    describe("#pop", () => {
        it("is ok to pop empty array", () => {
            expect(fa.getSize()).to.equal(0);
            fa.popItem(0);
            expect(fa.getSize()).to.equal(0);
        });

        it("reduces size", () => {
            fa.grow();
            fa.grow();
            fa.popItem(0);
            expect(fa.getSize()).to.equal(1);
        });
        it("removes correct item", () => {
            fa.grow();
            fa.getLastItem().value = 1;
            fa.grow();
            fa.getLastItem().value = 2;
            fa.popItem(0);
            expect(fa.getLastItem()).to.have.property("value", 2);
        });
    });

    it("#clear", () => {
        fa.grow();
        fa.grow();
        fa.grow();
        expect(fa.getSize()).to.equal(3);
        fa.clear();
        expect(fa.getSize()).to.equal(0);
    });

    it("#getItem", () => {
        fa.grow();
        expect(fa.getItem(0).value).to.equal(0);
    });

    it("iterators", () => {
        for (let i = 0; i < fa.getCapacity(); i++) {
            fa.grow();
            fa.getItem(i).value = i;
        }

        let cnt = 0;
        fa.forEach((i) => {
            expect(i.value).to.equal(cnt);
            cnt++;
        });

        cnt = 0;
        for (const item of fa) {
            expect(item.value).to.equal(cnt);
            cnt++;
        }
    });
});
