import React from 'react';
import { Route } from 'react-router-dom';
import { Router } from 'react-router';
import { observer } from 'mobx-react';
import * as firebase from 'firebase';
import Modal from 'react-bootstrap/esm/Modal';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';

import { Routes } from './constants/routes';
import LandingPage from './pages/LandingPage';
import RoomPage from './pages/RoomPage';
import { useStores } from './hooks/useStores';
import { firebaseAuthConfig } from './firebase/firebaseConfig';
import './App.css';

const App = () => {
  const { userStore, config, history } = useStores();
  const { user } = userStore;

  return (
    <Router history={history}>
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
