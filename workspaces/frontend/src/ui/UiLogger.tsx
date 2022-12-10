const enabled = true;

export function logMount(name: string) {
    if (!enabled) return;
    console.log(`${name}:onMount`);
}

export function logUnmount(name: string) {
    if (!enabled) return;
    console.log(`${name}:onCleanup`);
}
