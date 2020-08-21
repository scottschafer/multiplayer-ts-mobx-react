import * as firebase from 'firebase';
import * as firebaseui from 'firebaseui';

export const firebaseConfig = {
  apiKey: "AIzaSyA68hVCB6ElXaAYzHmJXXlu5P71wCr5r6E",
  authDomain: "multiplayer-game-f788f.firebaseapp.com",
  databaseURL: "https://multiplayer-game-f788f.firebaseio.com",
  projectId: "multiplayer-game-f788f",
  storageBucket: "multiplayer-game-f788f.appspot.com",
  messagingSenderId: "5875390216",
  appId: "1:5875390216:web:bea8ccd9f0c73c89b3bebd",
  measurementId: "G-72K4JV4XB9"
};

export const firebaseAuthConfig = {
  // signInSuccessUrl: '<url-to-redirect-to-on-success>',
  // Popup signin flow rather than redirect flow.
  signInFlow: 'popup',
  callbacks: {
    // Avoid redirects after sign-in.
    signInSuccessWithAuthResult: () => false
  },
  signInOptions: [
    // Leave the lines as is for the providers you want to offer your users.
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    firebase.auth.TwitterAuthProvider.PROVIDER_ID,
    firebase.auth.GithubAuthProvider.PROVIDER_ID,
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
    firebase.auth.PhoneAuthProvider.PROVIDER_ID,
    firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
  ],
  // tosUrl and privacyPolicyUrl accept either url string or a callback
  // function.
  // Terms of service url/callback.
  tosUrl: '<your-tos-url>',
  // Privacy policy url/callback.
  privacyPolicyUrl: function () {
    window.location.assign('<your-privacy-policy-url>');
  }
};