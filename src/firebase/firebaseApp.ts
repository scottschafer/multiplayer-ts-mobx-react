
import * as firebase from 'firebase';
import * as firebaseui from 'firebaseui';
import { firebaseConfig } from './firebaseConfig';

export const firebaseApp = firebase.initializeApp(firebaseConfig);
export const firebaseAppAuth = firebaseApp.auth();

export const firebaseAuthUI = new firebaseui.auth.AuthUI(firebase.auth());