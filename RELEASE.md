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

## How to play

* Player 1 (red) controls:
	* WASD to move
	* R to shoot
	* T to execute action
* Player 2 (green) controls:
	* IJKL to move
	* P to shoot
	* O to execute action
* Player 3 (blue) controls:
	* Numpad 5123 to move
	* Numpad 9 to shoot
	* Numpad 6 to execute action
* Player 4 (yello) controls:
	* GVBN to move
	* Space to shoot
	* H to execute action

You can also use gamepads to control the game. In that case, Dpad/Left stick are used to steer and thrust/shoot/action buttons are distributed between face buttons and triggers.

## Supported browsers

 * Microsoft Edge
 * Microsoft Edge on Xbox Series (press the menu button and switch inputs to game inputs)
 * Google Chrome
 * Firefox on Android
 * Google Chrome on Android

## Known issues

 * Game is running at half rate on Waterfox browsers
