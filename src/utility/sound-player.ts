import { Howl } from "howler";

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
            console.log(key + " set");
        }
    }

    playSound(id: T) {
        this.sounds.get(id)?.play();
    }
}
