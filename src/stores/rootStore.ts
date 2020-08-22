import { UserStore } from './userStore';
import { RoomStore } from './roomStore';
import { GameStore } from './gameStore';
import { ChatStore } from './chatStore';
import { getConfig } from '../GameConfig';
import { createBrowserHistory } from 'history';
import MobxReactRouter, { RouterStore, syncHistoryWithStore } from 'mobx-react-router';

export class RootStore {
  readonly config = getConfig();
  readonly userStore: UserStore;
  readonly roomStore: RoomStore;
  readonly gameStore: GameStore;
  readonly chatStore: ChatStore;

  readonly routingStore: RouterStore;
  readonly history: MobxReactRouter.SynchronizedHistory;


  constructor() {
    this.routingStore = new RouterStore();
    let browserHistory = createBrowserHistory();
    this.history = syncHistoryWithStore(browserHistory, this.routingStore);

    this.userStore = new UserStore(this);
    this.roomStore = new RoomStore(this);
    this.gameStore = new GameStore(this);
    this.chatStore = new ChatStore(this);
  }
}
