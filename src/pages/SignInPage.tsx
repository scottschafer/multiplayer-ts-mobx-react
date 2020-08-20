import * as firebase from 'firebase';
import React from 'react';
import { Redirect } from 'react-router-dom';
import withFirebaseAuth, { WrappedComponentProps } from 'react-with-firebase-auth';
import { Routes } from '../constants/routes';
import { firebaseAppAuth } from '../firebase/firebaseApp';
import UserForm from '../firebase/UserForm';



const FormWrapper: React.SFC = ({ children }) =>
  <>
    <div style={{ marginLeft: "1.34em" }}>
      {children}
    </div>
    <hr />
  </>;

const Loading = () => (
  <div style={{
    position: "fixed",
    display: "flex",
    top: 0,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "2.68em",
    background: "green",
    color: "white",
  }}>
    Loading..
  </div>
);


const SignInPage = ({
  user,
  error,
  loading,
  setError,
  signOut,
  // signInAnonymously,
  signInWithEmailAndPassword,
  signInWithGoogle,
  signInWithFacebook,
  // signInWithGithub,
  createUserWithEmailAndPassword,
}: WrappedComponentProps) => {

  if (user) {
    return <Redirect to={Routes.LANDING}></Redirect>;
  }

  return (
    <div className="SignInPage">
      <React.Fragment>
        {loading && <Loading />}

        <FormWrapper>
          <h1>react-with-firebase-auth</h1>
          <h3>a very simple demo showing it in action</h3>
          <h3>see user data and errors in the end of this page</h3>
        </FormWrapper>

        <FormWrapper>
          <h1>create user</h1>
          <UserForm onSubmit={createUserWithEmailAndPassword} />
        </FormWrapper>

        <FormWrapper>
          <h1>sign in</h1>
          <UserForm onSubmit={signInWithEmailAndPassword} />
        </FormWrapper>

        <FormWrapper>
          <h1>sign in with google</h1>
          <button onClick={signInWithGoogle}>sign in with google</button>
        </FormWrapper>

        <FormWrapper>
          <h1>sign in with Facebook</h1>
          <button onClick={signInWithFacebook}>sign in with github</button>
        </FormWrapper>
        {/* 
        <FormWrapper>
          <h1>sign in with github</h1>
          <h3>(no provider setup, good to see error message)</h3>
          <button onClick={signInWithGithub}>sign in with github</button>
        </FormWrapper>

        <FormWrapper>
          <h1>sign in anonymously</h1>
          <h3>(failing due to permissions, good to see error message)</h3>
          <button onClick={signInAnonymously}>sign in anonymously</button>
        </FormWrapper> */}

        <FormWrapper>
          <h1>sign out</h1>
          <button onClick={signOut}>sign out</button>
        </FormWrapper>

        <FormWrapper>
          <h1>clear error</h1>
          <button onClick={() => setError(null)}>clear error</button>
        </FormWrapper>

        <FormWrapper>
          <h1>user data</h1>
          <textarea style={{ width: 350, height: 200 }} value={JSON.stringify(user, null, 2)} />
        </FormWrapper>

        <FormWrapper>
          <h1>error data</h1>
          <textarea style={{ width: 350, height: 200 }} value={error} />
        </FormWrapper>
      </React.Fragment>
    </div>
  );
}


const providers = {
  googleProvider: new firebase.auth.GoogleAuthProvider(),
};


export default withFirebaseAuth({
  providers,
  firebaseAppAuth,
})(SignInPage);
