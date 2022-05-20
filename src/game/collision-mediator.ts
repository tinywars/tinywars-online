import { eventDestroyProjectile } from "../events/game-event";
import { Vector } from "../utility/vector";
import { GameContext } from "./game-context";
import { Obstacle } from "./obstacle";
import { Player } from "./player";
import { Projectile } from "./projectile";

export class CollisionMediator {
    static processCollisions(context: GameContext) {
        this.handleProjectileCollisionsWithPlayers(context);
        this.handleProjectileCollisionsWithObstacles(context);
        this.handlePlayerCollisionsWithObstacles(context);
        this.handleObstacleCollisionsWithObstacles(context);
    }

    private static handleProjectileCollisionsWithPlayers(context: GameContext) {
        context.projectiles.forEach((projectile) => {
            context.players.forEach((player) => {
                if (projectile.getCollider().collidesWith(player.getCollider()))
                    this.resolveProjectilePlayerCollision(
                        projectile,
                        player,
                        context,
                    );
            });
        });
    }

    private static handleProjectileCollisionsWithObstacles(
        context: GameContext,
    ) {
        context.projectiles.forEach((projectile) => {
            context.obstacles.forEach((obstacle) => {
                if (
                    projectile
                        .getCollider()
                        .collidesWith(obstacle.getCollider())
                )
                    this.resolveProjectileObstacleCollision(
                        projectile,
                        obstacle,
                        context,
                    );
            });
        });
    }

    private static handlePlayerCollisionsWithObstacles(context: GameContext) {
        context.players.forEach((player) => {
            context.obstacles.forEach((obstacle) => {
                if (player.getCollider().collidesWith(obstacle.getCollider()))
                    this.resolvePlayerObstacleCollision(
                        player,
                        obstacle,
                        context,
                    );
            });
        });
    }

    private static handleObstacleCollisionsWithObstacles(context: GameContext) {
        context.obstacles.forEach((obstacle1) => {
            context.obstacles.forEach((obstacle2) => {
                if (obstacle1.id === obstacle2.id) return;

                if (
                    obstacle1
                        .getCollider()
                        .collidesWith(obstacle2.getCollider())
                )
                    this.resolveObstacleObstacleCollision(
                        obstacle1,
                        obstacle2,
                        context,
                    );
            });
        });
    }

    private static resolveProjectilePlayerCollision(
        projectile: Projectile,
        player: Player,
        context: GameContext,
    ) {
        player.hit(projectile.getDamage());
        context.eventQueue.add(eventDestroyProjectile(projectile.id));
    }

    private static resolveProjectileObstacleCollision(
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
        context.eventQueue.add(eventDestroyProjectile(projectile.id));
    }

    private static resolvePlayerObstacleCollision(
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
    }

    private static resolveObstacleObstacleCollision(
        obstacle1: Obstacle,
        obstacle2: Obstacle,
        context: GameContext,
    ) {
        console.log(context.settings.OBSTACLE_BOUNCE_SLOW_FACTOR);
        console.log(obstacle1.getForward().toString());
        console.log(obstacle2.getForward().toString());

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

        console.log(obstacle1.getForward().toString());
        console.log(obstacle2.getForward().toString());

        // nudge them apart from each other so they won't become stuck
        const diff = Vector.diff(
            obstacle1.getCollider().getPosition(),
            obstacle2.getCollider().getPosition(),
        );

        // This is magic constant that says the following:
        // |diff| + k * |diff| = radius1 + radius2
        // so if we multiply diff with k, we can vector that has to
        // be used to nudge obstacles far enough to not be colliding anymore
        const k =
            (obstacle1.getCollider().radius +
                obstacle2.getCollider().radius -
                diff.getSize()) /
            diff.getSize();
        obstacle1.getCollider().move(diff.getScaled(k));
        obstacle2.getCollider().move(diff.getScaled(k).getInverted());
    }
}
