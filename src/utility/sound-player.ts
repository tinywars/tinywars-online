import { assert } from "chai";
import { Howl, Howler } from "howler";

export class SoundPlayer<T extends number> {
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
        this.sounds.get(id).play();
    }

    setVolume(level: number) {
        assert(
            0 <= level && level <= 1,
            "Volume level outsiede of <0, 1> interval",
        );

        for (const key of this.sounds.keys()) {
            this.sounds.get(key).setVolume(level);
        }
    }
}