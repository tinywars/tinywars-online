# tinywars-online

## Dependencies

-   node v16.x.x (LTS)

## Development

-   Install dependencies

```sh
npm ci
```

The project uses [NPM Workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces). There are 2 workspaces:
* `frontend`
* `backend`

The following command are available for both (substitute `<workspace>` with either)

-   Start dev server with live reload on source change

```sh
npm -w <workspace> run dev 
```

-   Build production artifacts into the `workspaces/<workspace>/dist` folder

```sh
npm -w <workspace> run build 
# or to build everything at once:
npm run build:all
```

The following commands act on the whole repository:

-   Lint

```sh
npm run lint

# to also fix all auto fixable errors, run
npm run lint:fix
```

The following commands currently work only for the `frontend` workspace:

-   Test

```sh
# To run all test suites, use
npm -w <workspace> run test:all

# to run only files mathing a certain pattern use
# note that we need to include ".spec.ts" so it doesn't try to run actual source files
npm -w <workspace> run test **/*pattern*.spec.ts

# to watch for changes on the test file and re-run it on save, use
npm -w <workspace> run test **/*pattern*.spec.ts -- --watch
# or the convenience npm script
npm -w <workspace> run test:watch **/*pattern*.spec.ts
```

- Test coverage

```sh
npm -w <workspace> run coverage
```

## Networking

To test networking in a local network (on different machines),

You must set the environmental variable `BACKEND_URL` to your machine's external IP address and the backend server's port (default `10555`).

Then run the frontend dev server with

```sh
npm -w frontend run dev -- --host
```

And run the backend server with:

```sh
npm -w backend run dev 
```

When the backend is running, you the frontend should show "Connection Status: Connected" in the lower right corner and you should be able to host a network game.

## Known issues

Game runs very sluggish on Waterfox browser.

