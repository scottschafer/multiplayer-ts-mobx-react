import { RootStore } from './rootStore';
import { Chat } from '../models/chat';
import { SyncrhonizedModelWatcher } from '../synchronization/syncrhonizedModelWatcher';
import { computed } from 'mobx';

export class ChatStore {

  // Automatically load and save the room (magic!)
  private readonly chatModelWatcher = new SyncrhonizedModelWatcher<Chat>(Chat, 'chats');


  @computed get currentChat() {
    return this.chatModelWatcher.model;
  }

  @computed get loadingState() {
    return this.chatModelWatcher.loadingState;
  }

  constructor(public readonly rootStore: RootStore) {
  }


}
