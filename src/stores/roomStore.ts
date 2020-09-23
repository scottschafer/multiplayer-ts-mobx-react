import { action, computed, observable, reaction, toJS } from 'mobx';
import { SynchronizedModelRunner, LoadingState } from '../synchronization/synchronizedModelRunner';
import { firebaseApp } from '../firebase/firebaseApp';
import { Chat } from '../models/chat';
import { JoinCode } from '../models/joinCode';
import { Player, PlayerType } from '../models/player';
import { Room } from '../models/room';
import { MakeWritable } from '../utils/changeProperties';
import { getCollectionFromDatabase } from '../utils/firebaseUtils';
import { getUniqueCode } from '../utils/getUniqueCode';
import { toMinifiedObject } from '../utils/objectUtils';
import { RootStore } from './rootStore';
import { Routes } from '../constants/routes';
import { GameState } from '../models/gameModel';


export class RoomStore {

  @observable readonly enteredJoinCode: string = '';
  @observable readonly joinCodeError: boolean = false;
  @observable readonly joinCodeLink: string = '';

  @observable readonly createdJoinCode: string = '';
  @observable readonly currentJoinCode: string = '';
  @observable readonly localRoom: Room = null;

  // Automatically load and save the room (magic!)
  private readonly roomModelRunner = new SynchronizedModelRunner<Room>(Room, 'rooms');

  @computed get currentUserIsRoomHost() {
    if (this.localRoom) {
      return true;
    }
    const { currentRoom } = this;
    const { user } = this.rootStore.userStore;
    return (currentRoom && user && currentRoom.hostIds.includes(user.uid));
  }

  @computed get currentUserIsWaitingToBeAdmitted() {
    if (this.localRoom) {
      return false;
    }
    const { currentRoom } = this;
    const { user } = this.rootStore.userStore;
    return currentRoom && user && !!currentRoom.usersWaitingToBeAdmitted.find(testUser => (testUser.uid === user.uid));
  }

  @computed get currentRoom() {
    if (this.localRoom) {
      return this.localRoom;
    }
    return this.roomModelRunner.model;
  }

  @computed get relativeCreatedRoomUrl() {
    return Routes.ROOM.replace(':id', this.createdJoinCode);
  }

  @computed get absoluteCreatedRoomUrl() {
    return window.origin + Routes.ROOM.replace(':id', this.createdJoinCode);
  }

  @computed get loadingState() {
    if (this.localRoom) {
      return LoadingState.Loaded;
    }
    return this.roomModelRunner.loadingState;
  }

  @action.bound setEnteredRoomCode(code: string) {
    this.asWriteable.enteredJoinCode = code;
  }

  @action.bound handleLeaveRoom() {

    const { currentRoom } = this;
    const { user } = this.rootStore.userStore;

    if (user && currentRoom) {
      currentRoom.handleUserLeft(user.uid);
    }
  }

  @action.bound handleRoomLoaded() {
    const user = this.rootStore.userStore.user;
    const currentRoom = this.currentRoom;
    if (user && currentRoom && !currentRoom.usersInRoom[user.uid]) {
      console.log(`adding user to room: ${user.uid}`);
      currentRoom.addUser(new Player(user));
    }
  }

  @action.bound admitUser(user: (Player | string)) {
    const uid = (typeof user === 'string') ? user : user.uid;
    this.currentRoom.admitUser(uid);

    const player = this.currentRoom.usersInRoom[uid];
    if (player) {
      const { gameStore } = this.rootStore;
      gameStore.joinGame(player);
    }
  }

  @action.bound blockUser(user: (Player | string)) {
    const uid = (typeof user === 'string') ? user : user.uid;
    this.currentRoom.blockUser(uid);
  }

  @action.bound unblockUser(user: (Player | string)) {
    const uid = (typeof user === 'string') ? user : user.uid;
    this.currentRoom.unblockUser(uid);
  }

  @action.bound ejectUser(user: (Player | string)) {
    const uid = (typeof user === 'string') ? user : user.uid;
    this.currentRoom.ejectUser(uid);
  }

  @action setLocalRoom(localRoom: Room) {
    if (localRoom.firebaseBacked) {
      console.error(`setLocalRoom() is for games that aren't backed by firebase!`);
    } else {
      this.asWriteable.localRoom = localRoom;
    }
  }

  async getJoinCodes() {
    const joinCodes = await getCollectionFromDatabase<JoinCode>('joinCodes');
    return new Promise<Array<JoinCode>>(resolve => {
      resolve(Object.values(joinCodes));
    });
  }

  @action async setCurrentJoinCode(id: string) {
    id = id.toLowerCase();
    if (id === 'singleplayer') {
      window.setTimeout(() => {
        this.playAsSinglePlayer();
      });
      return;
    }
    if (id === this.currentJoinCode) {
      return;
    }
    this.asWriteable.currentJoinCode = id;
  }

  constructor(public readonly rootStore: RootStore) {
    window.addEventListener('beforeunload', (event) => {
      this.handleLeaveRoom();
    });

    reaction(() => ({
      user: this.rootStore.userStore.user,
      usersInRoom: toJS(this.currentRoom?.usersInRoom)
    }),
      ({ user, usersInRoom }) => {
        // when the user and currentRoom are present, add the current user to the list of users in the room
        const currentRoom = this.currentRoom;
        if (user && usersInRoom && currentRoom && !usersInRoom[user.uid]) {
          console.log(`adding user to room: ${user.uid}`);
          currentRoom.addUser(new Player(user));

          if (currentRoom.hostIds.includes(user.uid)) {
            currentRoom.admitUser(user.uid);
          }
        }
      }, { delay: 100 });

    // react to the user entering a join code 
    reaction(() => ({
      enteredJoinCode: this.enteredJoinCode
    }),
      ({ enteredJoinCode }) => {
        this.asWriteable.joinCodeError = false;
        this.asWriteable.joinCodeLink = '';

        if (enteredJoinCode.length >= 3) {
          const database = firebaseApp.database();

          database.ref(`joinCodes/${enteredJoinCode.toLowerCase()}`).once('value', (snapshot) => {
            const val = snapshot.val();
            if (!val) {
              this.asWriteable.joinCodeError = true;
            } else {
              this.asWriteable.joinCodeLink = `room/${enteredJoinCode}`;
            }
          },
            (error) => {
              this.asWriteable.joinCodeError = true;
            });
        }
      });

    reaction(() => toJS(this.rootStore.routingStore.location?.hash),
      (hash) => {
        const pathname = (hash || '').substr(1);
        const roomPrefix = '/room/';
        if (pathname.startsWith(roomPrefix)) {
          const newRoomCode = pathname.substr(roomPrefix.length).split('?')[0];
          this.setCurrentJoinCode(newRoomCode);
        }
      }, { fireImmediately: true });


    reaction(() => ({
      user: this.rootStore.userStore.user,
      currentJoinCode: this.currentJoinCode
    }),
      ({ user, currentJoinCode }) => {
        if (user && currentJoinCode) {
          if (this.currentRoom) {
            this.currentRoom.handleUserLeft(user.uid);
          }

          console.log(`setCurrentJoinCode, id=${currentJoinCode}`);

          // find the room key from the join code
          this.getJoinCodes().then(joinCodes => {
            const joinCode = joinCodes.find(joinCode => (joinCode.code === currentJoinCode));
            this.roomModelRunner.key = joinCode?.roomKey || null;
          });
        }
      });

  }

  @action async createNewRoom() {
    await this.rootStore.userStore.requireAuthentication();

    const user = this.rootStore.userStore.user;
    const database = firebaseApp.database();

    this.asWriteable.createdJoinCode = '';

    const joinCodes = await this.getJoinCodes();
    const existingCodes = new Set<string>(Object.values(joinCodes).map(code => code.code));

    // determine and set a unique code to join the room
    const joinCode = getUniqueCode(existingCodes);
    this.asWriteable.createdJoinCode = joinCode;

    const player = new Player({ type: PlayerType.Human, ...user });

    // create the game and chat, then create a room and assign the keys to the room
    const game = this.rootStore.gameStore.createGame(
      {
        players: {
          [player.playerId]: player
        },
        playerOrder: [player.playerId]
      }
    );

    const chat = new Chat({ roomCode: joinCode });

    const minifiedGame = toMinifiedObject(game);
    const minifiedChat = toMinifiedObject(chat);

    const [gameResult, chatResult] = await Promise.all([
      database.ref('games').push(minifiedGame),
      database.ref('chats').push(minifiedChat)]);

    const room = new Room({
      joinCode,
      hostIds: [user.uid],
      userIdsAdmitted: [user.uid],
      gameKey: gameResult.key,
      chatKey: chatResult.key,
    });

    await room.put();

    // now create a room code mapping
    const joinCodeObj = new JoinCode({
      owner: user.uid,
      code: joinCode,
      roomKey: room.key
    });
    database.ref('joinCodes').child(joinCode).set(toMinifiedObject(joinCodeObj));
  }

  @action.bound playAsSinglePlayer() {

    const player1 = new Player({
      playerId: 'human',
      playerName: 'You',
      type: PlayerType.Human,
      uid: '1',
    });
    const player2 = new Player({
      playerId: 'AI',
      playerName: 'Computer',
      type: PlayerType.Computer,
      uid: '1'
    });

    const game = this.rootStore.gameStore.createGame(
      {
        players: {
          [player1.playerId]: player1,
          [player2.playerId]: player2
        },
        playerOrder: [player1.playerId, player2.playerId]
      }
    );

    this.rootStore.gameStore.setLocalGame(game);

    const room = new Room({
      firebaseBacked: false
    });

    this.asWriteable.localRoom = room;
    // this.rootStore.gameStore.controller.startGame();
  }

  private get asWriteable() {
    return this as MakeWritable<RoomStore>;
  }
}
