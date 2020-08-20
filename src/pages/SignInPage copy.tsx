import * as firebase from 'firebase';
import React from 'react';
import { Redirect } from 'react-router-dom';
import withFirebaseAuth, { WrappedComponentProps } from 'react-with-firebase-auth';
import { Routes } from '../constants/routes';
import { firebaseAppAuth } from '../firebase/firebaseApp';
// import UserForm from '../firebase/UserForm';
import { GlobalGameConfig } from '../GameConfig';
import './SignInPage.scss';
import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/Row';


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
  signInWithEmailAndPassword,
  signInWithGoogle,
  signInWithFacebook,
  signInWithGithub,
  createUserWithEmailAndPassword,
  forg
}: WrappedComponentProps) => {

  if (user) {
    return <Redirect to={Routes.LANDING}></Redirect>;
  }

  const config = GlobalGameConfig.authentication;


  return (
    <div className="SignInPage">
      <Container>
        <div>
          {/* <form action="/action_page.php"> */}
          <Row>
            {GlobalGameConfig.authentication.renderTitle()}
          </Row>
          <Row>
            {GlobalGameConfig.authentication.allowEmailSignIn &&
              <div className="vl">
                <span className="vl-innertext">or</span>
              </div>}
            <div className="col">
              {GlobalGameConfig.authentication.allowFacebookSignIn &&
                <a href="#" className="fb btn">
                  <i className="fa fa-facebook fa-fw" /> Login with Facebook
                </a>}
              {GlobalGameConfig.authentication.allowTwitterSignIn &&
                <a href="#" className="twitter btn">
                  <i className="fa fa-twitter fa-fw" /> Login with Twitter
                </a>}
              {GlobalGameConfig.authentication.allowGoogleSignIn &&
                <a href="#" className="google btn">
                  <i className="fa fa-google fa-fw" /> Login with Google+
                </a>}
            </div>
            {GlobalGameConfig.authentication.allowEmailSignIn &&
              <div className="col">
                <div className="hide-md-lg">
                  <p>Or sign in manually:</p>
                </div>
                <input type="text" name="username" placeholder="Username" required />
                <input type="password" name="password" placeholder="Password" required />
                <input type="submit" defaultValue="Login" />
              </div>}
          </Row>
          {/* </form> */}
        </div>
        {GlobalGameConfig.authentication.allowEmailSignIn &&
          <div className="bottom-container">
            <div className="row">
              <div className="col">
                <a href="#" style={{ color: 'white' }} className="btn">Sign up</a>
              </div>
              <div className="col">
                <a href="#" style={{ color: 'white' }} className="btn">Forgot password?</a>
              </div>
            </div>
          </div>}

      </Container>
    </div>
  );
}



// <React.Fragment>
// {loading && <Loading />}


// <FormWrapper>
//   {GlobalGameConfig.authentication.renderTitle()}
// </FormWrapper>

// {config.allowCreateUser && <>
// <FormWrapper>
//   <h1>create user</h1>
//   <UserForm onSubmit={createUserWithEmailAndPassword} />
// </FormWrapper>

// <FormWrapper>
//   <h1>sign in</h1>
//   <UserForm onSubmit={signInWithEmailAndPassword} />
// </FormWrapper>
// </>}

// {config.allowGoogleSignIn && 
// <FormWrapper>
//   <h1>sign in with google</h1>
//   <button onClick={signInWithGoogle}>sign in with google</button>
// </FormWrapper>
// }

// <div class="fb-login-button" data-size="large" data-button-type="continue_with" data-layout="default" data-auto-logout-link="false" data-use-continue-as="false" data-width=""></div>
// <FormWrapper>
//   <h1>sign in with Facebook</h1>
//   <button onClick={signInWithFacebook}>sign in with github</button>
// </FormWrapper>
// <FormWrapper>
//   <h1>sign in with github</h1>
//   <h3>(no provider setup, good to see error message)</h3>
//   <button onClick={signInWithGithub}>sign in with github</button>
// </FormWrapper>

// <FormWrapper>
//   <h1>sign in anonymously</h1>
//   <h3>(failing due to permissions, good to see error message)</h3>
//   <button onClick={signInAnonymously}>sign in anonymously</button>
// </FormWrapper>

// <FormWrapper>
//   <h1>sign out</h1>
//   <button onClick={signOut}>sign out</button>
// </FormWrapper>

// <FormWrapper>
//   <h1>clear error</h1>
//   <button onClick={() => setError(null)}>clear error</button>
// </FormWrapper>

// <FormWrapper>
//   <h1>user data</h1>
//   <textarea style={{ width: 350, height: 200 }} value={JSON.stringify(user, null, 2)} />
// </FormWrapper>

// <FormWrapper>
//   <h1>error data</h1>
//   <textarea style={{ width: 350, height: 200 }} value={error} />
// </FormWrapper>
// </React.Fragment>


const providers = {
  googleProvider: new firebase.auth.GoogleAuthProvider(),
};


export default withFirebaseAuth({
  providers,
  firebaseAppAuth,
})(SignInPage);
