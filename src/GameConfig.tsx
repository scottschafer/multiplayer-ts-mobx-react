import React from 'react';
import { Game } from './models/game';
import { SuperGhostGame } from './superGhostSample/models/superGhostGame';
import SuperGhostGamePage from './superGhostSample/components/SuperGhostGamePage';

interface GameConfig {
  factory: {
    gameFactory: typeof Game; // model
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
  }
}

export const getConfig = () => {
  const config: GameConfig = {
    factory: {
      gameFactory: SuperGhostGame,
      renderGame: () => <SuperGhostGamePage></SuperGhostGamePage>,
      renderLandingPageTitle: () => <h1>Superghost!</h1>,
    },
    config: {
      showEraseDB: true,
    },
    authentication: {
      renderSignInTitle: () => <h1>Sign in to play Superghost!</h1>,
      allowEmailSignIn: false,
      allowGoogleSignIn: true
    }
  };
  return config;
};

// GlobalGameConfig.factory.renderLandingPageTitle = () => <SuperGhostGamePage></SuperGhostGamePage>;
