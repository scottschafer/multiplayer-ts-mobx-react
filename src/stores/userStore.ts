import { observable, action } from 'mobx'
import { RootStore } from './rootStore';
import { firebaseApp } from '../firebase/firebaseApp';

export class UserStore {
  @observable waitingToAuthenticate: boolean = true;
  @observable user: firebase.User;
  @observable authenticationRequired: boolean = false;
  private resolveWithUserFunc: ((value?: firebase.User | PromiseLike<firebase.User>) => void) = null;

  constructor(public readonly rootStore: RootStore) {

    firebaseApp.auth().onAuthStateChanged((user) => {
      this.setUser(user);
      this.waitingToAuthenticate = false;
      if (user) {
        this.authenticationRequired = false;
        if (this.resolveWithUserFunc) {
          this.resolveWithUserFunc(user);
          this.resolveWithUserFunc = null;
        }
      }
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

  requireAuthentication(): Promise<firebase.User> {
    return new Promise<firebase.User>((resolve, reject) => {
      if (this.user) {
        resolve(this.user);
      } else {
        this.authenticationRequired = true;
        this.resolveWithUserFunc = resolve;
      }
    });
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
