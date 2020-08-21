import { MakeOptional } from "../utils/changeProperties";
import { observable, toJS } from "mobx";

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
      const objThis = toJS(this);
      const objSrc = toJS(src);
      Object.keys(objThis).forEach(key => {
        if (typeof objThis[key] !== 'function' && objSrc[key]) {
          newVals[key] = objSrc[key];
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
