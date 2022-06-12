import { GameContext } from "../game/game-context";
import { KeyCode } from "../game/key-codes";
import { Player } from "../game/player";
import { Vector } from "../utility/vector";
import { AiPoweredController } from "./ai-controller";
import { getTimeBeforeCollision, sanitizeAngle } from "../utility/math";
import { GameObject } from "../game/game-object";
import { FastArray } from "../utility/fast-array";
import { assert } from "chai";
import { Fsm, FsmTransitionCondition } from "./fsm";
import * as GameMath from "../utility/math";
import { If, Do, DoNothing } from "./fsm-builder";
import { Timer } from "../utility/timer";
import { CircleCollider } from "../utility/circle-collider";
import { PRNG } from "../utility/prng";
import { Powerup, PowerupType } from "../game/powerup";
import { GameSettings } from "../game/game-settings";

export enum State {
    Start,
    PickingTarget,
    TrackingAndShooting,
    StartEvasion,
    Evading,
    FinishEvasion,
    Drifting,
    Shoot,
    PickTargetPowerup,
    GoingAfterPowerup,
    PowerupUnattainable,
    ShootWhilePursuingPowerup,
}

enum ETimer {
    Fire,
    GoForward,
    Log,
    IgnorePowerups,
}

export function not(condition: FsmTransitionCondition): FsmTransitionCondition {
    return () => {
        return !condition();
    };
}

export function and(
    cond1: FsmTransitionCondition,
    cond2: FsmTransitionCondition,
): FsmTransitionCondition {
    return () => {
        return cond1() && cond2();
    };
}

export function alwaysTrue(): boolean {
    return true;
}

export function nothing() {
    // intentionally left blank
}

export class AiBrain {
    private timers: Record<ETimer, Timer>;
    private targetAngle = 0;
    private fsm: Fsm;
    private targetPlayer: Player;
    private targetPowerup: Powerup;
    private ANGLE_DIFF_THRESHOLD = 2;
    // fuzziness
    private collisionPanicRadius: number;
    private aimError = 0;
    private dodgeReactionTimeError = 0;
    private dumbness: number;
    private timeToCollision = 0; // used in pickEvasionAngle

    constructor(
        private controller: AiPoweredController,
        private myPlayer: Player,
        private context: GameContext,
    ) {
        const states = {
            /* eslint-disable */
            [State.Start]:
                Do(this.goForward).thenGoTo(State.PickingTarget),
            [State.PickingTarget]:
                If(this.isEverybodyElseDead).goTo(State.Drifting)
                .otherwiseDo(this.pickTargetPlayer).thenGoTo(State.TrackingAndShooting),
            [State.TrackingAndShooting]: 
                If(this.isCollisionImminent).goTo(State.StartEvasion)
                .orIf(this.isEverybodyElseDead).goTo(State.Drifting)
                .orIf(and(this.isPowerupInVicinity, this.timerEnded(ETimer.IgnorePowerups))).goTo(State.PickTargetPowerup)
                .orIf(this.isTargetDead).goTo(State.PickingTarget) // then to PickingTarget
                .orIf(this.canShoot).goTo(State.Shoot)
                .orIf(and(this.timerEnded(ETimer.GoForward),this.noCollisionInLookDirection)).goTo(State.Start)
                .otherwiseDo(this.trackTarget).andLoop(),
            [State.Shoot]:
                Do(this.shoot).thenGoTo(State.TrackingAndShooting),
            [State.StartEvasion]:
                Do(this.pickEvasionAngle).thenGoTo(State.Evading),
            [State.Evading]: 
                If(this.isEvasionAngleAchieved).goTo(State.FinishEvasion)
                .otherwiseDo(this.rotateTowardsEvasionTarget).andLoop(),
            [State.FinishEvasion]:
                Do(this.performEvasion).thenGoTo(State.TrackingAndShooting),
            [State.PickTargetPowerup]:
                Do(this.pickTargetPowerup).thenGoTo(State.GoingAfterPowerup),
            [State.GoingAfterPowerup]:
                If(this.isCollisionImminent).goTo(State.PowerupUnattainable)
                .orIf(and(this.isSomeoneInFrontOfMe, this.timerEnded(ETimer.Fire))).goTo(State.ShootWhilePursuingPowerup)
                .orIf(not(this.isTargetPowerupAvailable)).goTo(State.PickingTarget)
                .otherwiseDo(this.trackTargetPowerup).andLoop(),
            [State.PowerupUnattainable]:
                Do(this.handleBlockedPowerup).thenGoTo(State.StartEvasion),
            [State.ShootWhilePursuingPowerup]:
                Do(this.shoot).thenGoTo(State.GoingAfterPowerup),
            [State.Drifting]: DoNothing(),
            /* eslint-enable */
        };
        this.fsm = new Fsm(states, State.Start);
        this.targetPlayer = this.myPlayer; // just to satisfy linter
        this.targetPowerup = this.context.powerups.getItem(0); // just to satisfy linter

        this.timers = {
            [ETimer.Fire]: new Timer(() => context.settings.AI_SHOOT_DELAY),
            [ETimer.GoForward]: new Timer(() => PRNG.randomFloat() * 3 + 1.5),
            [ETimer.Log]: new Timer(() => 1),
            [ETimer.IgnorePowerups]: new Timer(
                () => this.context.settings.AI_POWERUP_IGNORE_DELAY,
            ),
        };

        this.dumbness = context.settings.AI_DUMBNESS[this.myPlayer.id];
        this.collisionPanicRadius =
            context.settings.AI_MAX_COLLISION_PANIC_RADIUS * this.dumbness;
        this.resetAimError();
        this.resetDodgeError();
    }

    update(dt: number) {
        this.releaseInputs();
        this.updateTimers(dt);

        this.aimError = GameMath.clamp(
            this.aimError -
                this.context.settings.AI_AIM_ERROR_DECREASE_SPEED *
                    dt *
                    this.context.settings.AI_MAX_AIM_ERROR,
            0,
            Infinity,
        );
        this.dodgeReactionTimeError = GameMath.clamp(
            this.dodgeReactionTimeError -
                this.context.settings.AI_MAX_COLLISION_DODGE_ERROR *
                    dt *
                    this.context.settings
                        .AI_COLLISION_DODGE_ERROR_DECREASE_SPEED,
            0,
            Infinity,
        );

        this.fsm.update();

        if (this.myPlayer.id === 3 && this.timers[ETimer.Log].ended()) {
            this.timers[ETimer.Log].reset();
        }
    }

    reset() {
        this.fsm.setState(State.Start);
        this.resetAimError();
        this.resetDodgeError();
    }

    /* NON FSM METHODS */
    private debugLog = (text: string, overrideTimer = false) => {
        if (this.myPlayer.id !== 0) return;
        if (this.myPlayer.getHealth() < 1) return;
        if (!(this.timers[ETimer.Log].ended() || overrideTimer)) return;
        console.log(text);
    };

    private releaseInputs() {
        this.controller.releaseKey(KeyCode.Up);
        this.controller.releaseKey(KeyCode.Down);
        this.controller.releaseKey(KeyCode.Left);
        this.controller.releaseKey(KeyCode.Right);
        this.controller.releaseKey(KeyCode.Shoot);
        this.controller.releaseKey(KeyCode.Action);
    }

    private updateTimers(dt: number) {
        Object.values(this.timers).forEach((t) => t.update(dt));
    }

    private resetAimError() {
        this.aimError = this.dumbness * this.context.settings.AI_MAX_AIM_ERROR;
    }

    private resetDodgeError() {
        this.dodgeReactionTimeError =
            this.dumbness * this.context.settings.AI_MAX_COLLISION_DODGE_ERROR;
    }

    private getOtherPlayers(players: FastArray<Player>): Player[] {
        return players.filter((p) => {
            return p.id != this.myPlayer.id;
        });
    }

    private targetObject(
        myPlayer: Player,
        object: GameObject,
        projectileAiming: boolean,
    ) {
        const settings = this.context.settings;
        const targetPoint =
            GameMath.getIntersectionBetweenMovingPointAndGrowingCircle(
                object.getCollider().getPosition(),
                object.getForward(),
                myPlayer.getCollider().getPosition(),
                projectileAiming
                    ? settings.PROJECTILE_SPEED
                    : settings.PLAYER_FORWARD_SPEED,
                this.myPlayer.getProjectileSpawnOffset(
                    projectileAiming ? settings.FIXED_FRAME_TIME : 0,
                ),
            );
        if (targetPoint === null) return;

        const direction = Vector.diff(
            targetPoint,
            myPlayer.getCollider().getPosition(),
        );

        if (projectileAiming) {
            // use aim error
            this.targetAngle =
                direction.toAngle() +
                PRNG.randomRangedFloat(-this.aimError, this.aimError);
        } else {
            // navigating towards powerup
            this.targetAngle = direction.toAngle();
        }
    }

    private isCollisionImminentForGivenFastArray(
        myCollider: CircleCollider,
        myForward: Vector,
        objects: FastArray<GameObject>,
        useScreenWrapTest = false,
    ) {
        const settings = this.context.settings;
        let result = false;
        let worstTimeToCollision = Infinity;
        const COLLISION_CRITICAL_TIME = 1 - this.dodgeReactionTimeError;

        const myColliderCopy = new CircleCollider(
            myCollider.getPosition(),
            myCollider.radius + this.collisionPanicRadius,
        );
        objects.forEach((o) => {
            const displacement = [Vector.zero()];
            if (useScreenWrapTest) {
                displacement.push(new Vector(settings.SCREEN_WIDTH, 0));
                displacement.push(new Vector(-settings.SCREEN_WIDTH, 0));
                displacement.push(new Vector(0, settings.SCREEN_HEIGHT));
                displacement.push(new Vector(0, -settings.SCREEN_HEIGHT));
            }

            displacement.forEach((offset) => {
                const objectCollider = new CircleCollider(
                    o.getCollider().getPosition().getSum(offset),
                    o.getCollider().radius,
                );

                const t = getTimeBeforeCollision(
                    myColliderCopy,
                    objectCollider,
                    myForward,
                    o.getForward(),
                );

                if (
                    t !== null &&
                    t < COLLISION_CRITICAL_TIME &&
                    t < worstTimeToCollision
                ) {
                    result = true;
                    worstTimeToCollision = t;
                }
            });
        });

        return {
            isCollisionImminent: result,
            timeToCollision: worstTimeToCollision,
        };
    }

    private getDiffFromTargetAngle = (): number => {
        return GameMath.radialDifference(
            this.targetAngle,
            this.myPlayer.getCoords().angle,
        );
    };

    /* FSM CONDITIONS */
    private isEverybodyElseDead = (): boolean => {
        return this.context.players.getSize() <= 1;
    };

    private isTargetDead = (): boolean => {
        return this.targetPlayer.getHealth() <= 0;
    };

    private isTargetPowerupAvailable = (): boolean => {
        for (const p of this.context.powerups)
            if (p.id == this.targetPowerup.id) return true;
        return false;
    };

    private isCloseEnoughToTarget = (): boolean => {
        return (
            Vector.diff(
                this.myPlayer.getCoords().position,
                this.targetPlayer.getCoords().position,
            ).getSize() < 300
        );
    };

    private timerEnded(id: ETimer): FsmTransitionCondition {
        return (): boolean => {
            return this.timers[id].ended();
        };
    }

    private noCollisionInLookDirection = (): boolean => {
        return !this.isCollisionImminentForGivenFastArray(
            this.myPlayer.getCollider(),
            Vector.fromPolar(
                this.myPlayer.getCoords().angle,
                this.myPlayer.getForward().getSize(),
            ),
            this.context.obstacles,
            false,
        ).isCollisionImminent;
    };

    private isTargetAngleAchieved = (): boolean => {
        return (
            GameMath.radialDifference(
                this.targetAngle,
                this.myPlayer.getCoords().angle,
            ) < this.ANGLE_DIFF_THRESHOLD
        );
    };

    private isEvasionAngleAchieved = (): boolean => {
        const myAngle = this.myPlayer.getCoords().angle;
        const diff = GameMath.radialDifference(myAngle, this.targetAngle);
        const inverseDiff = GameMath.radialDifference(
            GameMath.sanitizeAngle(myAngle + 180),
            this.targetAngle,
        );
        return (
            diff < this.ANGLE_DIFF_THRESHOLD ||
            inverseDiff < this.ANGLE_DIFF_THRESHOLD
        );
    };

    private isCollisionImminent = () => {
        const result1 = this.isCollisionImminentForGivenFastArray(
            this.myPlayer.getCollider(),
            this.myPlayer.getForward(),
            this.context.obstacles,
            true,
        );
        const result2 = this.isCollisionImminentForGivenFastArray(
            this.myPlayer.getCollider(),
            this.myPlayer.getForward(),
            this.context.projectiles,
            false,
        );

        this.timeToCollision = Math.min(
            result1.timeToCollision,
            result2.timeToCollision,
        );

        return result1.isCollisionImminent || result2.isCollisionImminent;
    };

    private isPowerupInVicinity = () => {
        const settings = this.context.settings;

        for (const p of this.context.powerups) {
            const distance = Vector.diff(
                this.myPlayer.getCoords().position,
                p.getCoords().position,
            ).getSize();

            if (
                p.getType() === PowerupType.Heal &&
                distance < settings.AI_POWERUP_ACTIONABLE_RADIUS
            )
                return true; // always go after healing
            if (distance < settings.AI_POWERUP_ACTIONABLE_RADIUS) return true;
        }

        return false;
    };

    private canShoot = () => {
        if (!this.timers[ETimer.Fire].ended()) {
            return false;
        }

        if (this.myPlayer.getEnergy() > 3 && this.isTargetAngleAchieved()) {
            return true;
        }

        return this.isTargetAngleAchieved() && this.isCloseEnoughToTarget();
    };

    private isSomeoneInFrontOfMe = () => {
        const otherPlayers = this.getOtherPlayers(this.context.players);
        for (let i = 0; i < otherPlayers.length; i++) {
            const dirVec = Vector.diff(
                otherPlayers[i].getCoords().position,
                this.myPlayer.getCoords().position,
            );
            const radialDiff = GameMath.radialDifference(
                dirVec.toAngle(),
                this.myPlayer.getCoords().angle,
            );
            if (radialDiff < this.ANGLE_DIFF_THRESHOLD) return true;
        }
        return false;
    };

    /* FSM LOGIC */
    private goForward = () => {
        this.controller.pressKey(KeyCode.Up);
        this.timers[ETimer.GoForward].reset();
    };

    private shoot = () => {
        this.controller.pressKey(KeyCode.Shoot);
        this.timers[ETimer.Fire].reset();
    };

    private performEvasion = () => {
        const diff = this.getDiffFromTargetAngle();
        if (diff < this.ANGLE_DIFF_THRESHOLD)
            this.controller.pressKey(KeyCode.Up);
        else this.controller.pressKey(KeyCode.Up);

        // Dodging impaires ability to properly aim and dodge for a while
        this.resetAimError();
        this.resetDodgeError();
    };

    private rotateTowardsTarget = () => {
        const myAngle = this.myPlayer.getCoords().angle;
        const diffAngle = sanitizeAngle(myAngle - this.targetAngle);
        if (diffAngle <= 180) this.controller.pressKey(KeyCode.Left);
        else if (diffAngle > 180) this.controller.pressKey(KeyCode.Right);
    };

    private rotateTowardsEvasionTarget = () => {
        const myAngle = this.myPlayer.getCoords().angle;

        const radialDiff1 = GameMath.radialDifference(
            myAngle,
            this.targetAngle,
        );
        const radialDiff2 = GameMath.radialDifference(
            myAngle,
            this.targetAngle + 180,
        );

        // If myAngle is closer to this.targetAngle + 180 than this.targetAngle,
        // rotate towards it and evasion will be done by going backwards
        const targetAngle =
            radialDiff1 < radialDiff2
                ? this.targetAngle
                : this.targetAngle + 180;
        const diff = sanitizeAngle(myAngle - targetAngle);
        if (diff <= 180) this.controller.pressKey(KeyCode.Left);
        else this.controller.pressKey(KeyCode.Right);
    };

    private trackTarget = () => {
        this.targetObject(this.myPlayer, this.targetPlayer, true);
        this.rotateTowardsTarget();
    };

    private trackTargetPowerup = () => {
        // Passing 0 here because here we're aiming at static object
        // no n
        this.targetObject(this.myPlayer, this.targetPowerup, false);
        this.rotateTowardsTarget();

        // TODO: if angle hasn't changed, don't press Up, but rather turbo (for just one frame)
        this.controller.pressKey(KeyCode.Up);
    };

    private handleBlockedPowerup = () => {
        // Shoot in the direction we're facing
        // Maybe it'll scare other players from taking it, maybe it'll
        // move the obstacle in our way
        this.controller.pressKey(KeyCode.Shoot);
        this.timers[ETimer.IgnorePowerups].reset();
    };

    private pickTargetPlayer = () => {
        const otherPlayers = this.getOtherPlayers(this.context.players);
        assert(
            otherPlayers.length,
            "Programmatic error: This function should never be called if there are no other players",
        );

        this.targetPlayer = otherPlayers[0];
        // The closer and weaker is a player, the lower score they get
        let lowestScore = Infinity;

        for (let i = 1; i < otherPlayers.length; i++) {
            const otherPlayer = otherPlayers[i];
            const score =
                Vector.diff(
                    otherPlayer.getCollider().getPosition(),
                    this.myPlayer.getCollider().getPosition(),
                ).getSize() +
                otherPlayer.getHealth() *
                    this.context.settings.AI_HEALTH_SCORE_WEIGHT;

            if (score < lowestScore) {
                this.targetPlayer = otherPlayer;
                lowestScore = score;
            }
        }
    };

    private pickTargetPowerup = () => {
        // lowest score - relative distance is the smalles
        let lowestScore = Infinity;
        this.context.powerups.forEach((p) => {
            let score = Vector.diff(
                this.myPlayer.getCoords().position,
                p.getCoords().position,
            ).getSize();
            if (p.getType() == PowerupType.Heal) {
                score -= this.context.settings.AI_HEALTH_POWERUP_SCORE_WEIGHT;
            }

            if (score < lowestScore) {
                this.targetPowerup = p;
                lowestScore = score;
            }
        });
    };

    private pickEvasionAngle = () => {
        const maxDeviation = GameMath.clamp(
            this.context.settings.PLAYER_ROTATION_SPEED *
                (this.timeToCollision - 0.1),
            0,
            75,
        );
        const randomDeviation = PRNG.randomRangedInt(
            -maxDeviation,
            maxDeviation,
        );
        this.targetAngle = sanitizeAngle(
            this.targetAngle + 180 + (maxDeviation > 0 ? randomDeviation : 0),
        );
        assert(!isNaN(this.targetAngle));
    };
}
