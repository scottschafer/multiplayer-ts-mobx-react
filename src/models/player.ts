import { MakeOptional } from "../utils/changeProperties";
import { observable } from "mobx";

export enum PlayerType {
  Human,
  Computer
}

export enum PlayerState {
  Playing,
  Eliminated,
  AWOL
}

export class Player {
  // private static readonly uidCounts = new Map<string, number>();
  uid: string = '';
  displayName: string = '';
  photoURL: string = '';
  @observable type: PlayerType = PlayerType.Human;
  @observable playerName: string = '';
  @observable state: PlayerState = PlayerState.Playing;
  @observable playerId: string = '';

  constructor(src?: MakeOptional<Player>) {
    const newVals: MakeOptional<Player> = {};

    if (src) {
      Object.keys(this).forEach(key => {
        if (typeof this[key] !== 'function' && src[key]) {
          newVals[key] = src[key];
        }
      });
    }

    if (!newVals.playerName && newVals.displayName) {
      newVals.playerName = newVals.displayName;
    }
    if (!newVals.playerId) {
      newVals.playerId = newVals.uid;
    }
    Object.assign(this, newVals);
  }
}
