
import { action, computed, observable, reaction, toJS } from 'mobx';

import { GameController } from "../controllers/gameController";
import { BattlebotsGameModel, GodotPlayerState, TurnPhase } from './BattlebotsGameModel';
import { UtilRandom } from '../utils/UtilsRandom';
import { GameState } from '../models/gameModel';
import { PlayerType, PlayerState } from '../models/player';
import { audioUtil, AudioType } from './AudioUtil';

export class BattlebotsGameController extends GameController {
  @observable currentTime: number = 0;

  constructor(public readonly game: BattlebotsGameModel) {
    super(game);

    this.initBoard();
  }

  startGame() {
    super.startGame();
    this.handleResetGame();
  }

  private initBoard() {
  };

  @action startTurn() {
    super.startTurn();
    this.initPlayerState();
  }

  initPlayerState() {
  }

  @action.bound handleResetGame() {
  }
}