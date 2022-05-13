/**
 * Fixed-size array abstraction with preallocated items and O(1) additions and deletions.
 * This array has two concepts of "size".
 * getSize() shows number of currently used or "alive" items
 * getCapacity() returns total number of available items in the array (same number that is passed into constructor)
 *
 * Size is incremented by calling grow(). If grow() would cause overflowing capacity,
 * it fails and return false.
 *
 * After calling grow(), one can call getLastItem() to manipulate this "newly added" item.
 *
 * Calling popItem(index) removes any item from the array which means it swaps it with
 * the last valid item in the array and then decrementing size. Because of that, order
 * of items is not stable.
 */
export class FastArray<T> implements Iterable<T> {
    private items: T[] = [];
    private size = 0;

    constructor(capacity: number, factory: (index: number) => T) {
        // Allocate array to have size equal to 'capacity'
        // and call constructor on all items through the factory method
        for (let i = 0; i < capacity; i++) this.items.push(factory(i));
    }

    /**
     * Grow size of the array by 1
     * @returns If size already matches capacity, do not grow and returns false
     */
    grow(): boolean {
        if (this.getSize() === this.getCapacity()) return false;

        this.size++;
        return true;
    }

    popItem(index: number) {
        if (index >= this.size) return;

        this.size--;

        // No need to swap anything if there was only 1 item
        if (this.size === 0) return;

        // Swap last item with the removed one
        const tmp = this.items[index];
        this.items[index] = this.items[this.size];
        this.items[this.size] = tmp;
    }

    clear() {
        this.size = 0;
    }

    getSize(): number {
        return this.size;
    }

    getCapacity(): number {
        return this.items.length;
    }

    getItem(index: number): T {
        // Not checking array bounds on purpose
        return this.items[index];
    }

    getLastItem(): T {
        return this.items[this.size - 1];
    }

    // Implementing Iterable<T>
    [Symbol.iterator](): Iterator<T, T, undefined> {
        let index = 0;
        return {
            next: () => ({
                done: index >= this.size,
                value: this.items[index++],
            }),
        };
    }

    forEach(cb: (item: T, index: number) => void) {
        for (let i = 0; i < this.size; i++) cb(this.items[i], i);
    }

    filter(condition: (a: T) => boolean): T[] {
        const result: T[] = [];
        this.forEach((item: T) => {
            if (condition(item)) result.push(item);
        });
        return result;
    }
}
