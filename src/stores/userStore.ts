import { observable, action } from 'mobx'
import { RootStore } from './rootStore';
import { firebaseApp } from '../firebase/firebaseApp';

export class UserStore {
  @observable waitingToAuthenticate: boolean = true;
  @observable user: firebase.User;

  constructor(public readonly rootStore: RootStore) {
    firebaseApp.auth().onAuthStateChanged((user) => {
      this.setUser(user);
      this.waitingToAuthenticate = false;
    });

    if (window.location.search) {
      const user = {
        displayName: window.location.search,
        uid: window.location.search,
        photoURL: ''
      };
      this.setUser(user as any as firebase.User)
    }
  }

  @action setUser(user: firebase.User) {
    if (user && this.user && user.uid === this.user.uid) {
      return;
    }
    this.user = user;
    if (user) {
      console.log(`logged in user, uid=${user.uid}, displayName=${user.displayName}`);
    }
  }

  @action.bound signOut() {
    firebaseApp.auth().signOut();
  }
}
