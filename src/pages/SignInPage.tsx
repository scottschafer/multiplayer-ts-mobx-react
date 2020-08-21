import * as firebase from 'firebase';
import React from 'react';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import { Redirect } from 'react-router-dom';
import { Routes } from '../constants/routes';
import { firebaseAuthConfig } from '../firebase/firebaseConfig';
import { useStores } from '../hooks/useStores';

const SignInPage = () => {

  const { userStore, config } = useStores();

  if (userStore.user) {
    return <Redirect to={Routes.LANDING}></Redirect>;
  }

  return (
    <div className="SignInPage">
      {config.authentication.renderSignInTitle()};
      <StyledFirebaseAuth uiConfig={firebaseAuthConfig} firebaseAuth={firebase.auth()} />
    </div>);
}


export default SignInPage;
