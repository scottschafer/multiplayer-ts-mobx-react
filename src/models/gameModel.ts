import { computed, observable } from "mobx";
import { SynchronizedModel } from '../synchronization/synchronizedModel';
import { MakeOptional } from "../utils/changeProperties";
import { Player } from './player';

export enum GameState {
  NotStarted,
  Started,
  PlayAgain
}

export class GameModel extends SynchronizedModel {
  @observable.ref playerPositions: Array<string> = [];
  @observable players: { [key: string]: Player } = {};
  @observable previousPlayerId: string = '';
  @observable currentPlayerIndex: number = -1;
  @observable gameState: GameState = GameState.NotStarted;
  @observable turnDirection = 1;

  @computed get previousPlayer() {
    return this.players[this.previousPlayerId];
  }

  @computed get currentPlayer(): Player {
    const { currentPlayerIndex, playerPositions, players } = this;
    if (currentPlayerIndex >= 0 && currentPlayerIndex < playerPositions.length) {
      return players[playerPositions[currentPlayerIndex]];
    }
    return null;
  }

  @computed get playerArray(): Array<Player> {
    return this.playerPositions.map(id => this.players[id]).filter(player => (!!player));
  }

  constructor(src?: MakeOptional<GameModel>) {
    super('games');

    if (src) {
      Object.assign(this, src);
      this.verifyData();
    }
  }

  assign(data: object) {
    super.assign(data);
    this.verifyData();

    if (!this.currentPlayer && this.gameState === GameState.Started) {
      this.gameState = GameState.NotStarted;
    }
  }

  verifyData() {
    const { players, playerPositions } = this;
    let cleanup = false;
    if (Object.keys(players).length !== playerPositions.length) {
      cleanup = true;
      console.error('players, playerPositions out of sync');
    }
    playerPositions.forEach(id => {
      if (!players[id]) {
        cleanup = true;
        console.error('players, playerPositions out of sync');
      }
    });
    if (cleanup) {
      // debugger;
      this.playerPositions = this.playerPositions.filter(id => (!!players[id]));
      Object.keys(this.players).forEach(playerId => {
        if (!this.playerPositions.includes(playerId)) {
          delete this.players[playerId];
        }
      });
    }
  }
}