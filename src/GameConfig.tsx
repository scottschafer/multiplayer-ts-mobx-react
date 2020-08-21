import React from 'react';
import { Game } from './models/game';
import { SuperGhostGame } from './superGhostSample/models/superGhostGame';
import SuperGhostGamePage from './superGhostSample/components/SuperGhostGamePage';

interface GameConfig {
  factory: {
    gameModelFactory: typeof Game; // model
    renderGame: () => JSX.Element; // view
    renderLandingPageTitle: () => JSX.Element,
  },
  config: {
    showEraseDB: boolean;
  },
  authentication: {
    renderSignInTitle: () => JSX.Element,
    allowEmailSignIn?: boolean,
    allowGoogleSignIn?: boolean,
    allowFacebookSignIn?: boolean,
    allowTwitterSignIn?: boolean,
    allowGithubSignIn?: boolean,
    allowAnonymousSignIn?: boolean,
  },
  development: {
    verbose: boolean,
    breakOnErrors: Boolean
  }
}

const config: GameConfig = {
  factory: {
    // override to supply your game model class:
    gameModelFactory: SuperGhostGame,
    // override to render your view:
    renderGame: () => <SuperGhostGamePage></SuperGhostGamePage>,
    renderLandingPageTitle: () =>
      <>
        <h1>Superghost!</h1>
        <p>A game of spelling and betrayal. Also known as "Lexicant". <a href='https://en.wikipedia.org/wiki/Ghost_(game)'>Rules here.</a></p>
      </>,
  },
  config: {
    // Only show the "Erase DB" button when on localhost. This is useful for development. It blows away all data.
    showEraseDB: (window.origin.includes('http://localhost')),
  },
  authentication: {
    renderSignInTitle: () => <h1>Sign in to play Superghost!</h1>,
    allowEmailSignIn: false,
    allowGoogleSignIn: true
  },
  development: {
    verbose: true,
    breakOnErrors: true
  }
};

export const getConfig: (() => GameConfig) = () => { return config; };
