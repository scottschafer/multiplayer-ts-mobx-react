import { RootStore } from './rootStore';
import { Chat } from '../models/chat';
import { ModelWatcher } from '../firebase/modelWatcher';
import { computed } from 'mobx';

export class ChatStore {

  // Automatically load and save the room (magic!)
  private readonly chatModelWatcher = new ModelWatcher<Chat>(Chat, 'chats');


  @computed get currentChat() {
    return this.chatModelWatcher.model;
  }

  @computed get loadingState() {
    return this.chatModelWatcher.loadingState;
  }

  constructor(public readonly rootStore: RootStore) {
  }


}
