
import { action, computed, observable, reaction, toJS } from 'mobx';

import { GameController } from "../controllers/gameController";
import { GodotGameModel, GodotPlayerState, TurnPhase } from './GodotGameModel';
import { UtilRandom } from '../utils/UtilsRandom';
import { AllDecks, LegendToDeckName } from './GodotConstants';
import { GameState } from '../models/gameModel';
import { PlayerType, PlayerState } from '../models/player';
import { godotAudioUtil, AudioType } from './GodotAudioUtil';


export type GameBoardSlot = {
  id?: string | number;
  col: number;
  row: number;
  legend?: string;
  className?: string;
  fillColor?: string;
  branches?: Array<string | number>;
}

export class GodotGameController extends GameController {
  @observable currentTime: number = 0;
  @observable boardSlots: Array<GameBoardSlot>;
  intervalId: any = null;

  cleanup() {
    clearInterval(this.intervalId);
  }

  constructor(public readonly game: GodotGameModel) {
    super(game);

    this.initBoard();

    reaction(() => ({
      game: toJS(game)
    }
    ),
      () => {
        // take turn for AI
        if (game.currentPlayer && game.currentPlayer.type === PlayerType.Computer) {
          const playerState = game.playerStates[game.currentPlayer.playerId];
          const phase = playerState.phase;
          const delay = 1000;
          switch (phase) {
            case TurnPhase.needRoll:
              window.setTimeout(() => {
                this.rollDie();
              }, delay);
              break;
            case TurnPhase.needMove:
              window.setTimeout(() => {
                this.movePlayerToPos(this.moveOptions[0][this.moveOptions[0].length - 1]);
              }, delay);
              break;
            case TurnPhase.pullCard:
              window.setTimeout(() => {
                this.handleClickCard();
              }, 4000);
              break;
          }
        }
      });
  }

  startGame() {
    super.startGame();
    this.handleResetGame();
  }

  private initBoard() {
    const boardSlots: Array<GameBoardSlot> = [];
    const hexes: Array<[number, number, any?, any?, any?]> = [

      // main track
      [11, 13, 'START', 'START'],
      [10, 13],
      [9, 13, null, 'E'],
      [8, 13],
      [7, 13, null, 'V'],
      [6, 13],
      [5, 13, null, 'E'],
      [4, 12],
      [3, 12],
      [3, 11, null, 'V'],
      [2, 10],
      [1, 10, null, 'E'],
      [1, 9],
      [0, 8, null, 'V'],
      [1, 7],
      [0, 6, null, 'E'],
      [1, 5],
      [0, 4, null, 'V'],
      [1, 3],
      [0, 2, null, 'E'],
      [1, 1],
      [2, 1, null, 'V'],
      [2, 0],
      [3, 0, null, 'P'],
      [4, 0],
      [5, 1, null, 'E'],
      [6, 1],
      [6, 0, null, 'V'],
      [7, 0],
      [8, 1, null, 'L'],
      [9, 1],
      [9, 0, null, 'P'],
      [10, 0],
      [11, 1, null, 'E'],
      [11, 2, null, 'L'],
      [11, 3, null, 'V'],
      [11, 4, null, 'P'],
      [11, 5, null, 'E'],
      [11, 6, null, 'L'],
      [11, 7, 'GODOT', 'Godot!', 'GODOT'],

      [5, 11],
      [6, 11, null, 'V'],
      [6, 10],
      [6, 9, null, 'E'],
      [5, 9],
      [4, 8, null, 'V'],
      [3, 8],
      [3, 7, null, 'E'],
      [3, 6],
      [3, 5, null, 'V'],
      [3, 4],
      [3, 3, null, 'E'],
      [3, 2],
      [4, 2, null, 'V'],


      [2, 7],
    ];

    let lastSlot = null;
    hexes.forEach(([col, row, id, legend, legendClassName]) => {
      if (id === null || id === undefined) {
        id = boardSlots.length;
      }
      // let nextId: any = boardSlots.length + 1;
      // if ()
      // if (boardSlots[id].id) {
      //   nextId = boardSlots[id].id;
      // }
      const slot = {
        id,
        col,
        row,
        branches: [],
        legend,
        legendClassName: legendClassName ? legendClassName : (((legend?.length === 1) ? 'legendCardClass' : ''))
      };
      boardSlots.push(slot);
      if (lastSlot) {
        lastSlot.branches.push(slot.id);
      }
      lastSlot = slot;
    });


    const godotSlot = boardSlots.find(slot => (slot.id === 'GODOT'));
    godotSlot.legend = 'Godot!';

    // boardSlots.find(slot => (slot.id === 'GODOT')).branches = [];
    const addConnection = (fromCol: number, fromRow: number, toCol: number, toRow: number, clearOthers: boolean = false) => {
      const from = boardSlots.find(slot => (slot.row === fromRow && slot.col === fromCol));
      const to = boardSlots.find(slot => (slot.row === toRow && slot.col === toCol));
      if (from && to) {
        if (clearOthers) {
          from.branches = [];
        }
        from.branches.push(to.id);
      }
    };

    // boardSlots[boardSlots.length - 1].branches = [];
    addConnection(4, 12, 5, 11);
    addConnection(4, 2, 5, 1, true);
    addConnection(3, 7, 2, 7);
    addConnection(2, 7, 1, 7);

    addConnection(11, 7, 11, 13, true);



    this.boardSlots = boardSlots;
  };

  @action startTurn() {
    super.startTurn();
    this.initPlayerState();
  }

  initPlayerState() {
    let state: GodotPlayerState = {
      phase: TurnPhase.needRoll,
      dieRoll: UtilRandom.rangeRandom(1, 6),
      flippedDeck: '',
      flippedCard: '',
      flippedCardAction: '',
      showDice: true,
      movePath: []
    }
    const playerId = this.game.currentPlayer.playerId;

    this.game.playerStates[playerId] = state;
    this.game.playerBoardPositions[playerId] = this.game.playerBoardPositions[playerId] || 0;
    return state;
  }

  @action.bound handleResetGame() {
    this.game.currentPlayerIndex = 0;
    const playerBoardPositions = {};
    this.game.playerArray.forEach(player => {
      playerBoardPositions[player.playerId] = 0;
      this.game.playerStates[player.playerId] = {
        phase: TurnPhase.needRoll,
        dieRoll: 0,
        showDice: true,
        flippedDeck: '',
        flippedCard: '',
        flippedCardAction: '',
        movePath: []
      };
    })
    this.game.playerBoardPositions = playerBoardPositions;

    let decks = JSON.parse(JSON.stringify(AllDecks)) as typeof AllDecks;
    let MaxCards = 8;

    Object.values(decks).forEach(deck => {
      deck.sort((a, b) => (Math.random() - .5));
      deck.length = Math.min(MaxCards, deck.length);
    });
    this.game.decks = decks;
  }

  @computed get moveOptions(): Array<Array<number>> {
    if (this.game.currentPlayer) {
      const playerState = this.game.playerStates[this.game.currentPlayer.playerId];
      const startPosition = this.game.playerBoardPositions[this.game.currentPlayer.playerId] || 0;
      const dieRoll = playerState.dieRoll;
      if (playerState.phase === TurnPhase.needMove) {

        const getMovePaths = (startPosition: number, numMoves: number) => {
          let paths: Array<string> = [];

          const calculateMovePath = (startPosition: number, numMoves: number, soFar: string) => {
            if (!numMoves) {
              paths.push(soFar);
              return;
            }
            let slot = this.boardSlots[startPosition];
            slot.branches.forEach(branchId => {
              const nextSoFar = soFar ? (soFar + ',') : soFar;
              console.log(`numMoves=${numMoves}, soFar=${soFar}, exploring from ${slot.id} to ${branchId}`);
              let nextSlotPosition = this.boardSlots.findIndex(slot => (slot.id === branchId));
              if (nextSlotPosition === -1) {
                debugger;
              }
              calculateMovePath(nextSlotPosition, numMoves - 1, nextSoFar + branchId);
            });
          }
          calculateMovePath(startPosition, numMoves, '');

          return paths.map(paths => {
            const result: Array<number> = [];
            const splitPath = paths.split(',');
            return splitPath.map(slotId => {
              return this.boardSlots.findIndex(slot => (('' + slot.id) === slotId));
            });
          });
        };

        return getMovePaths(startPosition, dieRoll);
      }
    }
    return [];
  }

  @action.bound rollDie() {
    godotAudioUtil.playSoundEffect(AudioType.SFX_ROLL);
    const playerId = this.game.currentPlayer.playerId;
    const currentPlayerState = this.game.playerStates[playerId];
    currentPlayerState.dieRoll = UtilRandom.rangeRandom(1, 6);
    currentPlayerState.phase = TurnPhase.rolling;
  }

  @action movePlayerToPos(pos: number) {
    if (this.game.currentPlayer) {
      const playerId = this.game.currentPlayer.playerId;
      const path = this.moveOptions.find(path => {
        return path[path.length - 1] === pos;
      });
      const state = this.game.playerStates[playerId];
      state.phase = TurnPhase.moving;
      state.movePath = path || [];
    }
  }

  @action handlePlayerArrivedAtPos(pos: number) {
    const playerId = this.game.currentPlayer.playerId;
    const currentPlayerState = this.game.playerStates[playerId];
    currentPlayerState.movePath = [];
    currentPlayerState.phase = TurnPhase.pullCard;
    currentPlayerState.showDice = false;
    this.game.playerBoardPositions[playerId] = pos;
    const slot = this.boardSlots[pos];
    switch (slot.legend) {
      default:
        this.endTurn();
        break;

      case 'E':
      case 'V':
      case 'P':
      case 'L':
        currentPlayerState.flippedDeck = slot.legend;
        const deck = this.game.decks[slot.legend];
        const card = deck.shift();
        if (deck.length) {
          currentPlayerState.flippedCard = card;
          currentPlayerState.flippedDeck = LegendToDeckName[slot.legend];
          currentPlayerState.flippedCardAction = ((slot.legend === 'E' || slot.legend === 'V') ? 1 : 2) + 2 * (deck.length % 2);
          currentPlayerState.phase = TurnPhase.pullCard;
        } else {
          this.game.gameState = GameState.PlayAgain;
        }
        break;
    }
  }

  @action.bound handleClickCard() {
    const playerId = this.game.currentPlayer.playerId;
    const currentPlayerState = this.game.playerStates[playerId];
    currentPlayerState.dieRoll = (typeof currentPlayerState.flippedCardAction === 'number') ? currentPlayerState.flippedCardAction : 0;
    currentPlayerState.phase = TurnPhase.needMove;
    currentPlayerState.flippedCard = currentPlayerState.flippedDeck = currentPlayerState.flippedCardAction = '';
  }
}