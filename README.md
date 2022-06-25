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

First, make sure you've ran `npm install` in both root folder and `backend` folder. Then run `npm run dev -- --host` in root folder and note your public IP address. Change value of `HOST_IP` const in `backend/settings.ts`. Now you can run `npm run dev` in backend folder.

In all browsers that you want to connect to your game, go to `http://<your ip>:3000/net`. Don't use localhost, it would be blocked by CORS.
Open a dev console. On host machine, type in `createLobby()`. On success you will get message: `Lobby created. Connection code: <code>`.

On all peer machines, enter command `connect(<code>)` into the browser console.

On host machine, type `startNetGame()`. The game will start. Each player in each of their browsers will have the controls of player 1 (WASD, R, T).

## Known issues

Game runs very sluggish on Waterfox browser.

