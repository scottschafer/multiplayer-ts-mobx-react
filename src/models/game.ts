import { Player, PlayerState } from './player';
import { observable, action, computed } from "mobx";
import { MakeOptional } from "../utils/changeProperties";
import { SynchronizedModel } from '../synchronization/synchronizedModel';

export enum GameState {
  NotStarted,
  Started,
  PlayAgain
}

export class Game extends SynchronizedModel {
  @observable.ref playerPositions: Array<string> = [];
  @observable players: { [key: string]: Player } = {};
  @observable previousPlayerId: string = '';
  @observable currentPlayerIndex: number = -1;
  @observable gameState: GameState = GameState.NotStarted;
  @observable turnDirection = 1;

  constructor(src?: MakeOptional<Game>) {
    super('games');

    if (src) {
      Object.assign(this, src);
      this.verifyData();
    }
  }

  assign(data: object) {
    super.assign(data);
    this.verifyData();
    // if (!this.currentPlayer) {
    //   this.currentPlayerIndex = -1;
    //   this.gameState = GameState.NotStarted;
    // }
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
      debugger;
      this.playerPositions = this.playerPositions.filter(id => (!!players[id]));
      Object.keys(this.players).forEach(playerId => {
        if (!this.playerPositions.includes(playerId)) {
          delete this.players[playerId];
        }
      });
    }
  }

  @computed get previousPlayer() {
    return this.players[this.previousPlayerId];
  }

  @computed get showAttendeeList() {
    return this.gameState === GameState.NotStarted;
  }

  @action addPlayer(player: Player) {
    if (!this.players[player.playerId]) {
      this.players[player.playerId] = player;
      this.playerPositions = [...this.playerPositions, player.playerId];
    }
    console.log(`after addPlayer, playerPositions=${JSON.stringify(this.playerPositions)}`);
  }

  @action removePlayer(player: Player) {
    if (this.players[player.playerId]) {
      delete this.players[player.playerId];
    }
    this.playerPositions = this.playerPositions.filter(id => (player.playerId !== id));
  }

  @computed get canStartGame() {
    return this.playerPositions.length >= 2;
  }

  @computed get currentPlayer(): Player {
    const { currentPlayerIndex, playerPositions, players } = this;
    if (currentPlayerIndex >= 0 && currentPlayerIndex < playerPositions.length) {
      return players[playerPositions[currentPlayerIndex]];
    }
    return null;
  }

  @computed get winningPlayer() {
    const currentPlayers = Object.values(this.players).filter(player => (player.state === PlayerState.Playing));
    if (currentPlayers.length === 1) {
      return currentPlayers[0];
    }
    return null;
  }

  @computed get playerArray(): Array<Player> {
    return this.playerPositions.map(id => this.players[id]).filter(player => (!!player));
  }

  startGame() {
    this.previousPlayerId = '';
    Object.values(this.players).forEach(player => {
      player.state = PlayerState.Playing;
    });
    this.currentPlayerIndex = -1;
    this.gameState = GameState.Started;
    this.goToNextPlayer();
  }

  @action startTurn() {

  }

  @action endTurn() {
    if (this.winningPlayer) {
      this.gameState = GameState.PlayAgain;
    } else {
      this.goToNextPlayer();
    }
  }

  @action goToNextPlayer() {
    this.previousPlayerId = this.currentPlayer?.playerId || '';
    let newIndex = this.currentPlayerIndex;
    for (let i = 0; i < this.playerPositions.length; i++) {
      newIndex = (newIndex + this.turnDirection + this.playerPositions.length) % this.playerPositions.length;

      if (this.players[this.playerPositions[newIndex]].state !== PlayerState.Eliminated) {
        this.currentPlayerIndex = newIndex;
        break;
      }
    }
    this.startTurn();
  }
}