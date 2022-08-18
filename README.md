# tinywars-online

## Dependencies

-   node v16.x.x (LTS)

## Development

-   Install dependencies

```sh
npm install
```

-   Start dev server (runs on [http://localhost:3000](http://localhost:3000) by default)

```sh
npm run dev
```

-   Build production artifacts into the `/dist` folder

```sh
npm run build
```

-   Lint

```sh
npm run lint

# to also fix all auto fixable errors, run
npm run lint:fix
```

-   Test

```sh
# To run all test suites, use
npm run test:all

# to run only files mathing a certain pattern use
# note that we need to include ".spec.ts" so it doesn't try to run actual source files
npm run test **/*pattern*.spec.ts

# to watch for changes on the test file and re-run it on save, use
npm run test **/*pattern*.spec.ts -- --watch
# or the convenience npm script
npm run test:watch **/*pattern*.spec.ts
```

- Test coverage

```sh
npm run coverage
```

## Networking

 1) Run `npm install` in root folder, followed by `npm run dev -- --host`
 2) Run `npm install` in `backend` folder, followed by `npm run dev`
 3) On the PC that should host the game, go to `http://<public ip>:3000/net/host`
	a) Open up a dev console
	b) Find a message that says "Lobby created". It contains URL that can be used by other peers to connect
 4) Host machine will see each new client pop up in the console. When you are ready, type in `startNetGame()`

> NOTE: Each player in each of their browsers will have the controls of player 1 (WASD, R, T).

> NOTE: https://webwormhole.io/ is great for sending out game codes.

## Known issues

Game runs very sluggish on Waterfox browser.

