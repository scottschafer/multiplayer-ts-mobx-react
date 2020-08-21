import { observable } from "mobx";
import { MakeOptional } from "../utils/changeProperties";
import { SynchronizedModel } from "../synchronization/synchronizedModel";

export class Message {
  message: string;
  timestamp: number;
  from: string;
  to: string;
}

export class Chat extends SynchronizedModel {
  readonly roomCode: string;
  @observable messages: Array<Message> = [];

  constructor(src?: MakeOptional<Chat>) {
    super('chats');
    if (src) {
      Object.assign(this, src);
    }
  }
}