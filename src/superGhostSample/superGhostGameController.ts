
import { action, computed, observable, reaction } from 'mobx';
import { GameController } from "../controllers/gameController";
import { GameState } from '../models/gameModel';
import { Player, PlayerState } from '../models/player';
import { Constants } from './constants';
import { initDictionary } from './dictionary';
import { SuperGhostGameModel } from './superGhostGameModel';

export class SuperGhostGameController extends GameController {
  @observable currentTime: number = 0;
  intervalId: any = null;

  cleanup() {
    clearInterval(this.intervalId);
  }

  constructor(public readonly game: SuperGhostGameModel) {
    super(game);
    initDictionary();

    this.currentTime = new Date().getTime();
    this.intervalId = setInterval(() => {
      this.currentTime = (new Date().getTime());
    }, 50);


    // handle timeout
    reaction(() => ({
      currentTime: this.currentTime,
      startTurnTime: this.game.startTurnTime,
      currentPlayer: this.game.currentPlayer
    }),
      ({ currentTime, startTurnTime, currentPlayer }) => {
        if ((this.game.gameState === GameState.Started)
          && currentPlayer
          && ((currentTime - startTurnTime) > (Constants.MaxSecondsPerTurn * 1000))) {
          this.handlePlayerOutOfTime();
        }
      }, { delay: 100 });
  }

  // assign(data: object) {
  //   super.assign(data);
  // }

  resetGame() {
    this.game.gameState = GameState.NotStarted;
    this.game.currentFragment = '';
    this.game.messageToCurrentPlayer = '';
    this.game.challenger = this.game.challenged = {};
    this.game.playerEvents = {};
    this.game.startTurnTime = new Date().getTime();
    this.game.turnDirection = 1;
  }

  startGame() {
    this.resetGame();
    super.startGame();
  }

  @computed get showAttendeeList() {
    return this.game.gameState !== GameState.Started;
  }

  @computed get challengeInProgress() {
    return !!this.game.challenger?.playerName;
  }

  @action startTurn() {
    this.game.startTurnTime = new Date().getTime();
    this.game.messageToCurrentPlayer = '';

    if (this.game.currentPlayer.state === PlayerState.Playing) {
      this.game.playerEvents[this.game.currentPlayer.playerId] = '';
    }
  }

  @action async handlePlayerAddedLetter(newWord: string) {
    const dictionary = await initDictionary();

    if (newWord.length !== (this.game.currentFragment.length + 1)) {
      console.error('new word must be one letter longer than current word');
    }
    if (!newWord.includes(this.game.currentFragment)) {
      console.error('new word must contain current word');
    }

    if (newWord.length >= Constants.MinLettersForSpellCheck && dictionary.checkWord(newWord)) {
      // it's in the dictionary, so illegal move
      this.game.messageToCurrentPlayer = `"${newWord}" is a word. Try again!`;
      return false;
    } else {
      this.game.playerEvents[this.game.currentPlayer.playerId] = ` played "${newWord}"`
      this.game.currentFragment = newWord;
      this.endTurn();
    }
  }


  @action.bound handlePlayerOutOfTime() {
    const { currentPlayer, playerEvents } = this.game;
    if (currentPlayer) {
      playerEvents[currentPlayer.playerId] = ' ran out of time!';
      currentPlayer.state = PlayerState.Eliminated;
      this.game.challenger = this.game.challenged = {};
      this.endTurn();
    }
  }

  @action.bound handleChallenge() {
    if (this.game.previousPlayer && this.game.currentPlayer) {

      this.game.challenger = new Player(this.game.currentPlayer);
      this.game.challenged = new Player(this.game.previousPlayer);

      this.game.turnDirection = -1;
      this.endTurn();

      this.game.playerEvents[this.game.challenger.playerId] = ` has challenged "${this.game.currentFragment}"`;
      this.game.playerEvents[this.game.challenged.playerId] = ` faces a challenge!`;
    }
  }

  @action async handleChangeChallengeText(val: string) {
    const dictionary = await initDictionary();
    if (!val.includes(this.game.currentFragment.toUpperCase())) {
      this.game.messageToCurrentPlayer = `Enter a legal word containing "${this.game.currentFragment.toUpperCase()}" to beat the challenge!`;
    } else if (val.length > this.game.currentFragment.length) {
      if (dictionary.checkWord(val)) {

        // if (checkWord(val)) {
        this.game.previousPlayer.state = PlayerState.Eliminated;
        this.game.turnDirection = 1;
        this.endTurn();
        this.game.playerEvents[this.game.challenged.playerId] = 'beat a challenge!';
        this.game.playerEvents[this.game.challenger.playerId] = `lost a challenge to ${this.game.challenged.playerName}!`;
        this.game.challenged = this.game.challenger = {};
      } else {
        this.game.messageToCurrentPlayer = `${val.toUpperCase()} is not a word. Try again.`;
      }
    }
  }

  @action resign() {
    this.game.currentPlayer.state = PlayerState.Eliminated;
    this.game.playerEvents[this.game.currentPlayer.playerId] = ' resigned!';
    this.endTurn();
  }

  @action endTurn() {

    super.endTurn();
    if (this.winningPlayer) {
      const { playerId, playerName } = this.winningPlayer;
      this.game.gameState = GameState.PlayAgain;
      const wins = this.game.winsPerPlayer[playerId]?.wins || 0;
      this.game.winsPerPlayer[playerId] = { name: playerName, wins: (wins + 1) };
    }
  }
}  