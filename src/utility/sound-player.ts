import { Howl } from "howler";

export class SoundPlayer {
    private sounds: Record<number, Howl> = {};

    addSoundSprite(path: string, code: number) {
        sounds[code] = new Howl({
            src: [path];
        });
    }

    playSound(code: number, channel: number) {}
}
