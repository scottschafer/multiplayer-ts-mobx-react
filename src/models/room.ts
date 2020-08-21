import { observable, computed, action } from 'mobx';
import { MakeOptional, MakeWritable } from "../utils/changeProperties";
import { SynchronizedModel } from '../synchronization/synchronizedModel';
import { Player } from './player';
import { firebaseApp } from '../firebase/firebaseApp';

export class Room extends SynchronizedModel {
  readonly name: string = '';;
  readonly joinCode: string = '';
  readonly gameKey: string = '';
  readonly chatKey: string = '';
  @observable readonly hostIds: Array<string> = [];
  @observable readonly userIdsAdmitted: Array<string> = [];
  @observable readonly userIdsBlocked: Array<string> = [];
  @observable readonly usersInRoom: { [id: string]: Player } = {};

  readonly firebaseBacked: boolean = true;

  @computed get requireSignIn() {
    return true;
  }

  constructor(src?: MakeOptional<Room>) {
    super('rooms');

    if (src) {
      Object.assign(this, src);
    }
  }

  assign(data: object) {
    super.assign(data);
  }

  addUser(player: Player) {
    if (!this.usersInRoom[player.uid]) {
      this.usersInRoom[player.uid] = player;
    }
  }

  handleUserLeft(uid: string) {
    const updates = {
      [`/${this.key}/usersInRoom/${uid}`]: null
    };

    firebaseApp.database().ref('rooms').update(updates);
    delete this.usersInRoom[uid];
  }

  isUserInRoom(user: (Player | string)): boolean {
    const uid = (typeof user === 'string') ? user : user.uid;

    return !!this.usersInRoom[uid];
  }

  @computed get usersWaitingToBeAdmitted() {
    const result = Object.values(this.usersInRoom).filter(user => (
      !this.userIdsAdmitted.includes(user.uid)
      && !this.userIdsBlocked.includes(user.uid)
    ));
    this.sortUsers(result);
    return result;
  }

  @computed get usersAdmitted() {
    const result = Object.values(this.usersInRoom).filter(user => (
      this.userIdsAdmitted.includes(user.uid)
    ));
    this.sortUsers(result);
    return result;
  }

  @computed get usersBlocked() {
    const result = Object.values(this.usersInRoom).filter(user => (
      this.userIdsBlocked.includes(user.uid)
    ));
    this.sortUsers(result);
    return result;
  }

  @action admitUser(uid: string) {
    // remove user from blocked list
    this.asWriteable.userIdsBlocked = this.userIdsBlocked.filter(blockedId => (blockedId !== uid));
    // add user to admitted list
    if (!this.userIdsAdmitted.includes(uid)) {
      this.userIdsAdmitted.push(uid);
    }
  }

  @action blockUser(uid: string) {
    // remove user from admitted list
    this.asWriteable.userIdsAdmitted = this.userIdsAdmitted.filter(admittedId => (admittedId !== uid));
    // add user to blocked list
    if (!this.userIdsBlocked.includes(uid)) {
      this.userIdsBlocked.push(uid);
    }
  }

  @action ejectUser(uid: string) {
    // remove user from admitted & blocked list
    this.asWriteable.userIdsAdmitted = this.userIdsAdmitted.filter(admittedId => (admittedId !== uid));
    this.asWriteable.userIdsBlocked = this.userIdsBlocked.filter(admittedId => (admittedId !== uid));
  }

  @action unblockUser(uid: string) {
    // remove user from blocked list
    this.asWriteable.userIdsBlocked = this.userIdsBlocked.filter(admittedId => (admittedId !== uid));
  }

  private sortUsers(users: Array<Player>) {
    // first sort by name
    users.sort((a, b) => {
      return (a.displayName || a.playerName).localeCompare((b.displayName || b.playerName));
    });

    // now put hosts first
    users.sort((a, b) => {
      const aIsHost = this.hostIds.includes(a.uid) ? 0 : 1;
      const bIsHost = this.hostIds.includes(b.uid) ? 0 : 1;
      return aIsHost - bIsHost;
    });
  }

  private get asWriteable() {
    return this as MakeWritable<Room>;
  }
}