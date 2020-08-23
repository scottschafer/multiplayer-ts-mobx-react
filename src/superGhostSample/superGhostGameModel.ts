import { observable } from 'mobx';
import { GameModel } from '../models/gameModel';
import { Player } from '../models/player';
import { MakeOptional } from "../utils/changeProperties";

export class SuperGhostGameModel extends GameModel {
  @observable superGhost: boolean = true; // if false, you can only add at the end

  @observable currentFragment: string = ''; // the word so far
  @observable startTurnTime: number = 0; // when the turn started
  @observable messageToCurrentPlayer: string = '';
  @observable playerEvents: { [playerId: string]: string } = {};
  @observable challenger: MakeOptional<Player>;
  @observable challenged: MakeOptional<Player>;
  @observable winsPerPlayer: { [playerId: string]: { name: string, wins: number } } = {};
}
