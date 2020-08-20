import React from 'react';
import { Game } from './models/game';
import { SuperGhostGame } from './superGhostSample/models/superGhostGame';
import SuperGhostGamePage from './superGhostSample/components/SuperGhostGamePage';

interface GameConfig {
  factory: {
    gameFactory: typeof Game; // model
    renderGame: () => JSX.Element; // view
  },
  config: {
    showEraseDB: boolean;
  },
  authentication: {
    renderTitle: () => JSX.Element,
    allowEmailSignIn?: boolean,
    allowGoogleSignIn?: boolean,
    allowFacebookSignIn?: boolean,
    allowTwitterSignIn?: boolean,
    allowGithubSignIn?: boolean,
    allowAnonymousSignIn?: boolean,
  }
}

export const GlobalGameConfig: GameConfig = {
  factory: {
    gameFactory: SuperGhostGame,
    renderGame: () => <SuperGhostGamePage></SuperGhostGamePage>
  },
  config: {
    showEraseDB: true,
  },
  authentication: {
    renderTitle: () => <h1>Sign in to play Superghost!</h1>,
    allowEmailSignIn: false,
    allowGoogleSignIn: true
  }
}