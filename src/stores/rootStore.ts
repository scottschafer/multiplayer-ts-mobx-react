import { UserStore } from './userStore';
import { RoomStore } from './roomStore';
import { GameStore } from './gameStore';
import { ChatStore } from './chatStore';

export class RootStore {
  public userStore: UserStore;
  public roomStore: RoomStore;
  public gameStore: GameStore;
  public chatStore: ChatStore;

  constructor() {
    this.userStore = new UserStore(this);
    this.roomStore = new RoomStore(this);
    this.gameStore = new GameStore(this);
    this.chatStore = new ChatStore(this);
  }
}