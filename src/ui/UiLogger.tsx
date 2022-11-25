const enabled = true;

export function logMount(name: string) {
    console.log(`${name}:onMount`);
}

export function logUnmount(name: string) {
    console.log(`${name}:onCleanup`);
}
