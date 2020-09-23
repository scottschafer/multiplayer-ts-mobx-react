import { action, computed } from "mobx";
import { GameModel, GameState } from '../models/gameModel';
import { Player, PlayerState } from '../models/player';

export interface IGameController {
  readonly showAttendeeList: boolean;
  readonly canStartGame: boolean;
  readonly currentPlayer: Player;
  readonly winningPlayer: Player;
  readonly playerArray: Array<Player>;

  cleanup();
  addPlayer(player: Player);
  removePlayer(player: Player);
  startGame();
  endTurn();
  goToNextPlayer();
};

export class GameController implements IGameController {
  constructor(public readonly game: GameModel) {
  }

  cleanup() {
  }

  @computed get showAttendeeList() {
    return this.game.gameState === GameState.NotStarted;
  }

  @computed get canStartGame() {
    return this.game.playerOrder.length >= 2;
  }

  @computed get currentPlayer(): Player {
    const { currentPlayerIndex, playerOrder: playerPositions, players } = this.game;
    if (currentPlayerIndex >= 0 && currentPlayerIndex < playerPositions.length) {
      return players[playerPositions[currentPlayerIndex]];
    }
    return null;
  }

  @computed get winningPlayer() {
    const currentPlayers = Object.values(this.game.players).filter(player => (player.state !== PlayerState.Eliminated));
    if (currentPlayers.length === 1) {
      return currentPlayers[0];
    }
    return null;
  }

  @computed get playerArray(): Array<Player> {
    return this.game.playerOrder.map(id => this.game.players[id]).filter(player => (!!player));
  }


  @action addPlayer(player: Player) {
    if (!this.game.players[player.playerId]) {
      this.game.players[player.playerId] = player;
      this.game.playerOrder = [...this.game.playerOrder, player.playerId];
    }
    console.log(`after addPlayer, playerPositions=${JSON.stringify(this.game.playerOrder)}`);
  }

  @action removePlayer(player: Player) {
    if (this.game.players[player.playerId]) {
      delete this.game.players[player.playerId];
    }
    this.game.playerOrder = this.game.playerOrder.filter(id => (player.playerId !== id));
  }

  startGame() {
    this.game.previousPlayerId = '';
    Object.values(this.game.players).forEach(player => {
      player.state = PlayerState.Playing;
    });
    this.game.currentPlayerIndex = -1;
    this.game.gameState = GameState.Started;
    this.goToNextPlayer();
  }

  @action startTurn() {

  }

  @action endTurn() {
    if (this.winningPlayer) {
      this.game.gameState = GameState.PlayAgain;
    } else {
      this.goToNextPlayer();
    }
  }

  @action goToNextPlayer() {
    this.game.previousPlayerId = this.game.currentPlayer?.playerId || '';
    let newIndex = this.game.currentPlayerIndex;
    for (let i = 0; i < this.game.playerOrder.length; i++) {
      newIndex = (newIndex + this.game.turnDirection + this.game.playerOrder.length) % this.game.playerOrder.length;

      if (this.game.players[this.game.playerOrder[newIndex]].state !== PlayerState.Eliminated) {
        this.game.currentPlayerIndex = newIndex;
        break;
      }
    }
    this.startTurn();
  }
}