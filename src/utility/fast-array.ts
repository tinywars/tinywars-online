export class FastArray<T> implements Iterable<T> {
    private items: T[] = [];
    private size = 0;

    constructor(capacity: number, factory: (index: number) => T) {
        // Allocate array to have size equal to 'capacity'
        // and call constructor on all items through the factory method
        for (let i = 0; i < capacity; i++)
            this.items.push(factory(i));
    }

    /**
     * Grow size of the array by 1
     * @returns If size already matches capacity, do not grow and returns false
     */
    grow(): boolean {
        if (this.getSize() === this.getCapacity())
            return false;

        this.size++;
        return true;
    }

    popItem(index: number) {
        if (index >= this.size)
            return;

        this.size--;

        // No need to swap anything if there was only 1 item
        if (this.size === 0)
            return;

        // Swap last item with the removed one
        const tmp = this.items[index];
        this.items[index] = this.items[this.size];
        this.items[this.size] = tmp;
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
    [Symbol.iterator](): Iterator<T,any,undefined> {
        let index = 0;
        return {
            next: () => ({
                done: index >= this.size,
                value: this.items[index++]
            })
        }
    }
     
    forEach(cb: (item: T, index: number) => void) {
        for (let i = 0; i < this.size; i++)
            cb(this.items[i], i)
    }
}

// TODO: some testing framework would be nice
export function TestFastArray() {
    class A {
        constructor(public value: number) {}
    }

    function Assert(cond: boolean, msg: string) {
        if (!cond) 
            throw msg;
    }

    function PrintArray(arr: FastArray<A>) {
        console.log("Printing array, size = " + arr.getSize());
        arr.forEach((item: A, index: number) => {
            console.log("Item[" + index + "]: " + item.value);
        });   
    }

    try {
        const arr = new FastArray<A>(5, () => new A(0));
        Assert(arr.getSize() === 0, "New array is empty");
        Assert(arr.getCapacity() === 5, "New array has correct capacity");
        
        arr.popItem(0);
        Assert(arr.getSize() === 0, "It is ok to pop empty array");
        
        Assert(arr.grow(), "Grow 0 -> 1");
        arr.getLastItem().value = 1;
        Assert(arr.grow(), "Grow 1 -> 2");
        arr.getLastItem().value = 2;
        Assert(arr.getSize() === 2, "Grow works");

        arr.popItem(0);
        Assert(arr.getSize() === 1, "Pop works (size reduced)");
        Assert(arr.getItem(0).value === 2, "Pop works (correct item removed)");

        Assert(arr.grow(), "Grow 1 -> 2");
        Assert(arr.getLastItem().value === 1, "Popped and restored value is still there");

        Assert(arr.grow(), "Grow 2 -> 3");
        Assert(arr.grow(), "Grow 3 -> 4");
        Assert(arr.grow(), "Grow 4 -> 5");
        Assert(!arr.grow(), "Cannot grow past capacity");

        PrintArray(arr);

        console.log("TestFastArray ok");
    }
    catch (exception: any) {
        console.error("TestFastArray failed: " + exception);
    }
}
