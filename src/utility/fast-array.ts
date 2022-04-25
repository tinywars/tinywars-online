export class FastArray<T> {
    private items: T[] = [];
    private scheduledDeletions: number[] = [];
    private size = 0;

    pushItem(item: T) {
        if (this.items.length === this.size)
            this.items.push(item);
        else
            this.items[this.size] = item;
        this.size++;
    }

    popItem(index: number) {
        if (index >= this.size)
            return;
        this.size--;
        this.items[index] = this.items[this.size];
    }

    schedulePopItem(index: number) {
        if (index >= this.size)
            return;
        this.scheduledDeletions.push(index);
    }

    popScheduledItems() {
        this.scheduledDeletions.sort((a: number, b:number) => {
            return b - a;
        });

        this.scheduledDeletions.forEach(index => {
            this.popItem(index);
        });

        this.scheduledDeletions = [];
    }

    getSize(): number {
        return this.size;
    }

    getItem(index: number): T {
        // Not checking array bounds on purpose
        return this.items[index];
    }

    getLastItem(): T {
        return this.items[this.size - 1];
    }

    // TODO: iterators that support forEach or for..in or for..of?
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
        for (let i = 0; i < arr.getSize(); i++)
            console.log("Item[" + i + "]: " + arr.getItem(i).value);
    }

    try {
        const arr = new FastArray<A>();
        Assert(arr.getSize() === 0, "New array is empty");
        
        arr.popItem(0);
        Assert(arr.getSize() === 0, "It is ok to pop empty array");
        
        arr.pushItem(new A(1));
        arr.pushItem(new A(20));
        Assert(arr.getSize() === 2, "Push works");

        arr.popItem(0);
        Assert(arr.getSize() === 1, "Pop works (size reduced)");
        Assert(arr.getItem(0).value === 20, "Pop works (correct item removed)");

        arr.pushItem(new A(4));
        Assert(arr.getSize() === 2, "Get last item (getSize)");
        Assert(arr.getItem(1).value === 4, "Get last item works: " + arr.getLastItem().value);

        arr.pushItem(new A(6));
        arr.pushItem(new A(8));
        arr.pushItem(new A(10));
        
        arr.schedulePopItem(0);
        arr.schedulePopItem(3);
        arr.schedulePopItem(1);
        arr.popScheduledItems();

        Assert(arr.getSize() === 2, "Scheduled pop released correct number of items: " + arr.getSize());
        Assert(arr.getItem(0).value === 6, "Scheduled pop kept correct item [0]");
        Assert(arr.getItem(1).value === 10, "Scheduled pop kept correct item [1]");

        console.log("TestFastArray ok");
    }
    catch (exception: any) {
        console.error("TestFastArray failed: " + exception);
    }
}
