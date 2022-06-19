import { assert } from "chai";
import { Howl } from "howler";
// Howler.stop();
// Howler.unload();
// Howler.autoUnlock = true;
// Howler.html5PoolSize = 1000;

export class SoundPlayer<T extends string> {
    private sounds: Map<T, Howl>;

    constructor(private configuration: Record<T, string>) {
        this.sounds = new Map();
        for (const key in configuration) {
            this.sounds.set(
                key,
                new Howl({
                    src: this.configuration[key],
                }),
            );
        }
    }

    playSound(id: T) {
        this.sounds.get(id)?.play();
    }

    setVolume(level: number) {
        assert(
            0 <= level && level <= 1,
            "Volume level is outside of <0, 1> interval",
        );

        for (const key of this.sounds.keys()) {
            this.sounds.get(key)?.volume(level);
        }
    }
}
