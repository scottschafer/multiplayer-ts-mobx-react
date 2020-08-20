import firebaseConfig from "./firebaseConfig";

import * as firebase from 'firebase';

export const firebaseApp = firebase.initializeApp(firebaseConfig);
export const firebaseAppAuth = firebaseApp.auth();
