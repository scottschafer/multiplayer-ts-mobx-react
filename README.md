## multiplayer-ts-mobx-react

Demo: [https://multiplayer-game-f788f.web.app](https://multiplayer-game-f788f.web.app)

While this might appear to be a web-based implementation of the game "Superghost" (aka [Lexicant](https://en.wikipedia.org/wiki/Lexicant)), it aims to be something more.

It's also a demonstration of a serverless technology stack that uses Mobx, React and Firebase to implement Zoom-like room functionality and painless data persistence and synchronization.

And it's also a platform for creating multiplayer games in the cloud without much effort.

## Model persistence and synchronization

Important data objects, such as the current room and game, are automatically synchronized with the firebase database. When you write to them, your changes are saved. If an instance of the application on another machine updates a model, the changes are synchronized to the model. Provided your fields are `@observable`, components that are `observer` will automatically render the updates.

Using a `SynchronizedModel` subclass and `SynchronizedModelRunner`, any changes made to the model's `@observable` fields (including any nested objects) will be automatically written to a Firebase database. If an instance of the application on a different machine changes that object, those changes will be automatically received and applied to the model as well.

This mechanism is efficient. If you change only one field of a nested object, only that field will be updated in the DB.

To start the database connection, create the `SynchronizedModelRunner` like so:
```
  private readonly roomModelRunner = new SynchronizedModelRunner<Room>(Room, 'rooms');
```

This won't start synchronization until you set its key (example: `roomModelRunner.key = '123'`). Once that has been set, it will automatically read and write `roomModelRunner.model` to the database whenever changes are made. Magic!

## Rooms, Room Codes, Users, Players and Games

A room is similar to what you have in Zoom. It has a host, and users can join a room by going to a URL and waiting to be admitted. Rooms have associated short codes (`JoinCode`) that are easy to type, and which map to full `Room` objects.

Each room will be linked to a game.

A user is an authenticated Firebase user, with a user id (`uid`). There may be more than one player with the same user id when multiple players are using the same browser window. That is, I could join a game on my computer and add two players - one for myself and one for my son. Then I could challenge my brother, who would add two players: himself and his daughter.

## Developing your own games

Superghost is cool and all, but the cooler thing to do is develop your own game. It's designed to be pretty simple. First, subclass a `Game` model to contain your data. Create a React component to render your view (make it an `observer`). Then link up your model and view factories in `src/GameConfig.tsx`. Boom, you have a multiplayer game in the cloud.

While the demo is turn based, there's no real reason the gameplay couldn't be simultaneous.

## TODO:

* Deletion of rooms and games when last player leaves.
* Simple chat functionality
* Tighter DB security rules. Only authenticated and admitted users should be able to change a `Game` object, etc.
* Better documentation, code cleanup etc.
* More tests.
* More games!
* Improve UI

## Support, documentation, bug fixes

No. ;)

Well, maybe. I might push some more bugfixes in the future, and I'd love to clean up and document some code, but not sure when I will have the time. Feel free to open pull requests, though!

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
