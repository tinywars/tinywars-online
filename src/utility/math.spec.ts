import { expect } from "chai";
import * as GameMath from "./math";

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
});