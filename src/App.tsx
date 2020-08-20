import React from 'react';
import {
  BrowserRouter as Router,
  Route
} from 'react-router-dom';
import './App.css';
import { Routes } from './constants/routes';
import LandingPage from './pages/LandingPage';
import RoomPage from './pages/RoomPage';
import SignInPage from './pages/SignInPage';

const App = () => (
  <Router>
    <div className="app">
      <Route exact={true} path={Routes.LANDING} component={() => <LandingPage />} />
      <Route exact={true} path={Routes.SIGN_IN} component={() => <SignInPage />} />
      <Route exact={true} path={Routes.ROOM} component={() => <RoomPage />} />
    </div>
  </Router>
);

export default App;
