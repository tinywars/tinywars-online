export class PRNG {
    private static lastValue = 0;
    static readonly MOD = 2 ** 32;

    static setSeed(seed: number) {
        PRNG.lastValue = seed % PRNG.MOD;
    }

    /**
     * @returns Random integer from 0 to 2^32-1
     */
    static randomInt(): number {
        PRNG.lastValue = (69069 * PRNG.lastValue + 1) % PRNG.MOD;
        return PRNG.lastValue;
    }

    /**
     * @returns Random float from interval <0,1)
     */
    static randomFloat(): number {
        return PRNG.randomInt() / PRNG.MOD;
    }

    /**
     * Get random integer from range <min..max)
     * @param min Minimum value of random number (inclusive)
     * @param max Maximum value of random number (exclusive)
     */
    static randomRangedInt(min: number, max: number): number {
        return (PRNG.randomInt() % (max - min)) + min;
    }

    static randomRangedFloat(min: number, max: number): number {
        return PRNG.randomFloat() * (max - min) + min;
    }

    static randomItem<T>(items: T[]): T {
        return items[PRNG.randomInt() % items.length];
    }
}
