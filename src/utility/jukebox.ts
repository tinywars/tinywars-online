import { Howl, Howler } from "howler";

export class Jukebox {
    private songs: Howl[] = [];
    private songIndex = 0;

    constructor(private playlist: string[]) {
        for (const fileName of playlist) {
            const song = new Howl({
                src: [fileName],
                html5: true, // prefer streaming to get better performance for large files
            });

            song.on("end", () => {
                // TODO: fade with next song
                this.songIndex = (this.songIndex + 1) % this.songs.length;
                setTimeout(() => {
                    this.playNextSong();
                }, 1500);
            });

            this.songs.push(song);
        }
    }

    playNextSong() {
        this.songs[this.songIndex].play();
    }

    stop() {
        this.songs[this.songIndex].stop();
    }

    setVolume(level: number) {
        this.songs.forEach((song) => {
            song.volume(level);
        });
    }
}
