/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect } from "chai";
import { AnimationEngine, AnimationFrame } from "./animation";

describe("Animation", () => {
    const FPS = 2;
    const UPDATE_TIME = 1 / FPS;

    let animationEngine: AnimationEngine<any>;
    const animationDb = {
        loopState: [
            new AnimationFrame(0, 0, 2, 2),
            new AnimationFrame(2, 0, 2, 2),
        ],
        simpleState: [new AnimationFrame(0, 2, 2, 2)],
    };

    beforeEach(() => {
        animationEngine = new AnimationEngine(animationDb, 2);
    });

    describe("#update", () => {
        it("Loops over looping state", () => {
            animationEngine.setState("loopState", true);

            for (let i = 0; i < animationDb.loopState.length * 2; i++) {
                expect(
                    animationEngine.update(UPDATE_TIME),
                    "Expecting update to always return true",
                ).to.be.true;
                expect(
                    (animationEngine as any).currentState,
                    "Expecting currentState to be set to loopState",
                ).to.equal("loopState");
            }
        });

        it("Returns false if simple state ends", () => {
            animationEngine.setState("simpleState");

            expect(animationEngine.update(UPDATE_TIME)).to.be.false;
        });

        it("Only decreases timer if update time is small enough", () => {
            animationEngine.setState("simpleState");
            expect(animationEngine.update(UPDATE_TIME / 2)).to.be.true;
            expect((animationEngine as any).frameTimer).to.equal(
                UPDATE_TIME / 2,
            );
        });
    });

    describe("#setState", () => {
        it("Throws exception on invalid state name", () => {
            expect(
                animationEngine.setState.bind(animationEngine, "invalidState"),
            ).to.throw(
                "Programatic error: Trying to use non-existent animation state invalidState",
            );
        });

        it("Does nothing if animation is already set", () => {
            animationEngine.setState("loopState", true);

            expect((animationEngine as any).frameIndex).to.equal(0);
            expect(animationEngine.update(UPDATE_TIME)).to.be.true;

            expect((animationEngine as any).frameIndex).to.equal(1);
            animationEngine.setState("loopState", true);

            expect((animationEngine as any).frameIndex).to.equal(1);
        });
    });
});
