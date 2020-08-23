import React from 'react';
import { GameModel } from '../models/gameModel';
import { SuperGhostGameModel } from '../superGhostSample/superGhostGameModel';
import SuperGhostGameView from '../superGhostSample/SuperGhostGameView';
import { IGameController } from '../controllers/gameController';
import { SuperGhostGameController } from '../superGhostSample/superGhostGameController';

interface GameConfig {
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
  factory: {
    // override to supply your game model class
    gameModelFactory: SuperGhostGameModel,
    // override to render your view:
    gameViewFactory: () => <SuperGhostGameView></SuperGhostGameView>,
    gameControllerFactory: (game: SuperGhostGameModel) => (new SuperGhostGameController(game)),

    renderLandingPageTitle: () =>
      <>
        <div style={{
          width: '100%', backgroundColor: 'lightyellow', padding: 5, marginBottom: 10,
          boxShadow: '2px 2px 8px 0px rgba(0,0,0,0.75)'
        }}>
          <h3>built with <a href="https://github.com/scottschafer/multiplayer-ts-mobx-react">multiplayer-ts-mobx-react</a></h3>
          <p><i>A platform for quickly developing multiplayer games in the cloud.</i></p>
        </div>

        <h1>Superghost!</h1>
        <p>A game of spelling and betrayal. Also known as "Lexicant". </p>
        <div style={{ textAlign: 'left' }}>
          <p>The first player picks a letter. The next player adds a letter to the beginning or end, and so on, but you cannot add a letter if
          the result is a legal word that's more than three letters long. If you force your opponents to have to make a word, you'll win. Example:</p>
          <ul>
            <li>Player #1: A</li>
            <li>Player #2: AB</li>
            <li>Player #3: ABB</li>
            <li>Player #1: CABB</li>
            <li>Player #2: CABBI</li>
            <li>Player #3: CABBIE</li>
            <li>Player #1: <b>$%^@!!*</b></li>
          </ul>
          <p>If you don't think a legal word can be made with the letters passed to you, challenge your opponent. They will need to supply a legal word
            or lose. But if they pass the challenge, they win.</p>
        </div>

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
    verbose: true,
    breakOnErrors: true
  }
};

export const getConfig: (() => GameConfig) = () => { return config; };
