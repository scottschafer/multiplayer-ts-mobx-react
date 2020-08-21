import { RootStore } from './rootStore';
import { Chat } from '../models/chat';
import { SynchronizedModelRunner } from '../synchronization/synchronizedModelRunner';
import { computed } from 'mobx';

export class ChatStore {

  // Automatically load and save the room (magic!)
  private readonly chatModelRunner = new SynchronizedModelRunner<Chat>(Chat, 'chats');


  @computed get currentChat() {
    return this.chatModelRunner.model;
  }

  @computed get loadingState() {
    return this.chatModelRunner.loadingState;
  }

  constructor(public readonly rootStore: RootStore) {
  }


}
