import { observable } from "mobx";
import { MakeOptional } from "../utils/changeProperties";
import { WatchableModel } from "./watchableModel";

export class Message {
  message: string;
  timestamp: number;
  from: string;
  to: string;
}

export class Chat extends WatchableModel {
  readonly roomCode: string;
  @observable messages: Array<Message> = [];

  constructor(src?: MakeOptional<Chat>) {
    super('chats');
    if (src) {
      Object.assign(this, src);
    }
  }
}