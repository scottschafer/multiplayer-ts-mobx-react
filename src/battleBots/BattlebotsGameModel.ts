import { observable } from 'mobx';
import { GameModel } from '../models/gameModel';

export enum TurnPhase {
  needRoll,
  rolling,
  needMove,
  moving,
  pullCard
};

export class GodotPlayerState {
  phase: TurnPhase;
  dieRoll: number;
  showDice: boolean;
  flippedDeck: string;
  flippedCard: string;
  flippedCardAction: number | string;
  movePath: Array<number>;
};

export class BattlebotsGameModel extends GameModel {

  @observable playerBoardPositions: { [playerId: string]: number } = {};
  @observable playerItems: { [playerId: string]: Array<String> } = {};
  @observable boardItems: { [position: number]: string } = {};
  @observable playerHands: { [playerId: string]: Array<string> } = {};
  @observable decks: {
    E: Array<string>, // Estragon
    V: Array<string>, // Vladmir
    P: Array<string>, // Pozzo
    L: Array<string> // Lucky
  } = { E: [], V: [], P: [], L: [] };

  @observable playerStates: { [playerId: string]: GodotPlayerState } = {};

  init() {
  }
}
