/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect } from "chai";
import { AiPoweredController } from "../ai/ai-controller";
import { KeyCode } from "../game/key-codes";

describe("Controller", () => {
    let controller: AiPoweredController = new AiPoweredController();

    beforeEach(() => {
        controller = new AiPoweredController();
        controller.releaseKey(KeyCode.Action);
        controller.releaseKey(KeyCode.Shoot);
    });

    describe("#readAttackToggled", () => {
        it("Properly releases attack after first read until input physically released", () => {
            expect((controller as any).isWaitingForAttackToRelease).to.be.false;

            controller.pressKey(KeyCode.Shoot);
            expect(controller.readAttackToggled()).to.be.true;
            expect((controller as any).isWaitingForAttackToRelease).to.be.true;
            expect(controller.readAttackToggled()).to.be.false;

            controller.releaseKey(KeyCode.Shoot);
            expect(controller.readAttackToggled()).to.be.false;
            expect((controller as any).isWaitingForAttackToRelease).to.be.false;

            controller.pressKey(KeyCode.Shoot);
            expect(controller.readAttackToggled()).to.be.true;
            expect((controller as any).isWaitingForAttackToRelease).to.be.true;
        });
    });

    describe("#readActionToggled", () => {
        it("Properly releases action after first read until input physically released", () => {
            expect((controller as any).isWaitingForActionToRelease).to.be.false;

            controller.pressKey(KeyCode.Action);
            expect(controller.readActionToggled()).to.be.true;
            expect((controller as any).isWaitingForActionToRelease).to.be.true;
            expect(controller.readActionToggled()).to.be.false;

            controller.releaseKey(KeyCode.Action);
            expect(controller.readActionToggled()).to.be.false;
            expect((controller as any).isWaitingForActionToRelease).to.be.false;

            controller.pressKey(KeyCode.Action);
            expect(controller.readActionToggled()).to.be.true;
            expect((controller as any).isWaitingForActionToRelease).to.be.true;
        });
    });
});
