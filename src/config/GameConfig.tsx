import React from 'react';
import { GameModel } from '../models/gameModel';
import { IGameController } from '../controllers/gameController';
import { GodotGameModel } from '../waitingForGodot/GodotGameModel';
import GodotGameView from '../waitingForGodot/GodotGameView';
import { GodotGameController } from '../waitingForGodot/GodotGameController';

interface GameConfig {
  windowTitle: string,
  allowSinglePlayer: boolean,
  factory: {
    // model, view, controller factories for the game
    gameModelFactory: typeof GameModel;
    gameViewFactory: () => JSX.Element; // view
    gameControllerFactory: ((game) => IGameController)
    renderLandingPageTitle: () => JSX.Element,
  },
  config: {
    showEraseDB: boolean;
  },
  authentication: {
    renderSignInTitle: () => JSX.Element,
    // allowEmailSignIn?: boolean,
    // allowGoogleSignIn?: boolean,
    // allowFacebookSignIn?: boolean,
    // allowTwitterSignIn?: boolean,
    // allowGithubSignIn?: boolean,
    // allowAnonymousSignIn?: boolean,
  },
  development: {
    verbose: boolean,
    breakOnErrors: Boolean
  }
}

const config: GameConfig = {
  windowTitle: 'Waiting for Godot',
  allowSinglePlayer: true,
  factory: {
    // override to supply your game model class
    gameModelFactory: GodotGameModel,
    // override to render your view:
    gameViewFactory: () => <GodotGameView></GodotGameView>,
    gameControllerFactory: (game: GodotGameModel) => (new GodotGameController(game)),

    renderLandingPageTitle: () =>
      <>
        <div style={{
          width: '100%', backgroundColor: 'lightyellow', padding: 5, marginBottom: 10,
          boxShadow: '2px 2px 8px 0px rgba(0,0,0,0.75)'
        }}>
          <h3>built with <a href="https://github.com/scottschafer/multiplayer-ts-mobx-react">multiplayer-ts-mobx-react</a></h3>
          <p><i>A platform for quickly developing multiplayer games in the cloud.</i></p>
          <p>by Scott Schafer (scott.schafer@gmail.com)</p>
        </div>

        <h1>Waiting for Godot</h1>
        <h2>the board game</h2>
        <br></br>
        <br></br>


      </>,
  },
  config: {
    // Only show the "Erase DB" button when on localhost. This is useful for development. It blows away all data.
    showEraseDB: (window.origin.includes('http://localhost')),
  },
  authentication: {
    renderSignInTitle: () => <h3>Sign in required</h3>,
    // allowEmailSignIn: false,
    // allowGoogleSignIn: true
  },
  development: {
    verbose: false,
    breakOnErrors: true
  }
};

export const getConfig: (() => GameConfig) = () => { return config; };
