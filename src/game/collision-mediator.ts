import {
    eventDestroyPowerup,
    eventDestroyProjectile
} from "../events/game-event";
import { forEachPairOf } from "../utility/fast-array";
import { Vector } from "../utility/vector";
import { GameContext } from "./game-context";
import { GameObject } from "./game-object";
import { Obstacle } from "./obstacle";
import { Player } from "./player";
import { Powerup } from "./powerup";
import { Projectile } from "./projectile";

export class CollisionMediator {
    static processCollisions(context: GameContext) {
        this.handleProjectileCollisionsWithPlayers(context);
        this.handleProjectileCollisionsWithObstacles(context);
        this.handlePlayerCollisionsWithObstacles(context);
        this.handleObstacleCollisionsWithObstacles(context);
        this.handlePlayerCollisionsWithPowerups(context);
    }

    private static handleProjectileCollisionsWithPlayers(context: GameContext) {
        forEachPairOf(
            context.projectiles,
            context.players,
            (projectile, player) => {
                if (projectile.getCollider().collidesWith(player.getCollider()))
                    this.resolveProjectileWithPlayerCollision(
                        projectile,
                        player,
                        context,
                    );
            },
        );
    }

    private static handleProjectileCollisionsWithObstacles(
        context: GameContext,
    ) {
        forEachPairOf(
            context.projectiles,
            context.obstacles,
            (projectile, obstacle) => {
                if (
                    projectile
                        .getCollider()
                        .collidesWith(obstacle.getCollider())
                )
                    this.resolveProjectileWithObstacleCollision(
                        projectile,
                        obstacle,
                        context,
                    );
            },
        );
    }

    private static handlePlayerCollisionsWithObstacles(context: GameContext) {
        forEachPairOf(
            context.players,
            context.obstacles,
            (player, obstacle) => {
                if (player.getCollider().collidesWith(obstacle.getCollider()))
                    this.resolvePlayerWithObstacleCollision(
                        player,
                        obstacle,
                        context,
                    );
            },
        );
    }

    private static handleObstacleCollisionsWithObstacles(context: GameContext) {
        forEachPairOf(
            context.obstacles,
            context.obstacles,
            (obstacle1, obstacle2) => {
                if (obstacle1.id === obstacle2.id) return;

                if (
                    obstacle1
                        .getCollider()
                        .collidesWith(obstacle2.getCollider())
                )
                    this.resolveObstacleWithObstacleCollision(
                        obstacle1,
                        obstacle2,
                        context,
                    );
            },
        );
    }

    private static handlePlayerCollisionsWithPowerups(context: GameContext) {
        forEachPairOf(context.players, context.powerups, (player, powerup) => {
            if (player.getCollider().collidesWith(powerup.getCollider())) {
                this.resolvePlayerWithPowerupCollision(
                    player,
                    powerup,
                    context,
                );
            }
        });
    }

    private static resolveProjectileWithPlayerCollision(
        projectile: Projectile,
        player: Player,
        context: GameContext,
    ) {
        player.hit(projectile.getDamage());
        context.eventQueue.add(
            eventDestroyProjectile(projectile.id, player.getForward()),
        );
        context.eventEmitter.emit("PlayerWasHit");
    }

    private static resolveProjectileWithObstacleCollision(
        projectile: Projectile,
        obstacle: Obstacle,
        context: GameContext,
    ) {
        obstacle.hit(
            projectile
                .getForward()
                .getScaled(
                    context.settings.PROJECTILE_MASS /
                        context.settings.OBSTACLE_MASS,
                ),
        );
        context.eventQueue.add(
            eventDestroyProjectile(projectile.id, obstacle.getForward()),
        );
        context.eventEmitter.emit(
            obstacle.isWreck() ? "WreckWasHit" : "RockWasHit",
        );
    }

    private static resolvePlayerWithObstacleCollision(
        player: Player,
        obstacle: Obstacle,
        context: GameContext,
    ) {
        player.hit(context.settings.OBSTACLE_HIT_DAMAGE);
        obstacle.hit(
            player
                .getForward()
                .getScaled(
                    context.settings.PLAYER_MASS /
                        context.settings.OBSTACLE_MASS,
                ),
        );

        this.nudgeTwoObjectsApartFromEachOther(player, obstacle);
    }

    private static resolveObstacleWithObstacleCollision(
        obstacle1: Obstacle,
        obstacle2: Obstacle,
        context: GameContext,
    ) {
        // Exchange their movement vectors
        const tmpForward = obstacle1
            .getForward()
            .getScaled(context.settings.OBSTACLE_BOUNCE_SLOW_FACTOR);
        obstacle1.setForward(
            obstacle2
                .getForward()
                .getScaled(context.settings.OBSTACLE_BOUNCE_SLOW_FACTOR),
        );
        obstacle2.setForward(tmpForward);

        this.nudgeTwoObjectsApartFromEachOther(obstacle1, obstacle2);
        context.eventEmitter.emit("ObstacleBounced");
    }

    private static resolvePlayerWithPowerupCollision(
        player: Player,
        powerup: Powerup,
        context: GameContext,
    ) {
        player.give(powerup.getType());
        context.eventEmitter.emit("PowerupPickedUp");
        context.eventQueue.add(eventDestroyPowerup(powerup.id));
    }

    private static nudgeTwoObjectsApartFromEachOther(
        obj1: GameObject,
        obj2: GameObject,
    ) {
        const diff = Vector.diff(
            obj1.getCollider().getPosition(),
            obj2.getCollider().getPosition(),
        );

        // This is magic constant that says the following:
        // |diff| + k * |diff| = radius1 + radius2
        // so if we multiply diff with k, we can vector that has to
        // be used to nudge obstacles far enough to not be colliding anymore
        const k =
            (obj1.getCollider().radius +
                obj2.getCollider().radius -
                diff.getSize()) /
            diff.getSize();
        obj1.getCollider().move(diff.getScaled(k));
        obj2.getCollider().move(diff.getScaled(k).getInverted());
    }
}
