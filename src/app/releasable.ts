export abstract class Releasable {
    // Release (or stop) all held resources
    abstract release(): void;
}
