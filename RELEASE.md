# README

## Requirements

* node v16.x.x (LTS)

## How to run
### Frontend

The built static files (SPA) are located in the `frontend` folder, you can serve it using your favorite server. For example:
```sh
npx serve frontend -s
```
(note the -s flag for SPA, that means all requests will return index.html)

### Backend
The backend is only necessary for network play, `cd` to the `backend` folder and run:
```sh
# install dependencies using npm
npm install --omit=dev
# start the server
node main
```

## Supported browsers

 * Microsoft Edge
 * Microsoft Edge on Xbox Series (press the menu button and switch inputs to game inputs)
 * Google Chrome
 * Firefox on Android
 * Google Chrome on Android

## Known issues

 * Game is running at half rate on Waterfox browsers
