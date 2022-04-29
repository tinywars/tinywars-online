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
npm run test

# to run only files mathing a certain pattern matching a pattern "something", run
# TODO: this does not work for some reason, probably due to typescript transpilation
npm run test something

# to watch for changes on the test file and re-run it on save, use
# TODO: this also does not work, probably for the same reason. I'll have to do more research
npm run test -- --watch
```
