import React from 'react';
import { Route } from 'react-router-dom';
// import { Router } from 'react-router';
import { HashRouter as Router } from 'react-router-dom';
import { observer } from 'mobx-react';
import * as firebase from 'firebase';
import Modal from 'react-bootstrap/esm/Modal';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';

import { Routes } from './constants/routes';
import LandingPage from './pages/LandingPage';
import RoomPage from './pages/RoomPage';
import { useStores } from './hooks/useStores';
import { firebaseAuthConfig } from './config/firebaseConfig';
import { getConfig } from './config/GameConfig';
import './App.css';
import TestScene from './TestScene';

const App = () => {
  const { userStore, config, history } = useStores();
  const { user } = userStore;

  document.title = getConfig().windowTitle;

  // return (
  //   <div className="App">
  //     <h1>hi</h1>
  //     <TestScene />
  //   </div>
  // );

  return (
    // <Router history={history}>
    <Router>
      <div className="app">
        <Route exact={true} path={Routes.LANDING} component={() => <LandingPage />} />
        <Route exact={true} path={Routes.ROOM} component={() => <RoomPage />} />

        <Modal show={!user && userStore.authenticationRequired && !userStore.waitingToAuthenticate}>
          <Modal.Body>
            {config.authentication.renderSignInTitle()}
            <StyledFirebaseAuth
              uiConfig={firebaseAuthConfig}
              firebaseAuth={firebase.auth()} />
          </Modal.Body>
        </Modal>
      </div>
    </Router>);
}

export default observer(App);
