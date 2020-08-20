import { observable, action, reaction, computed } from 'mobx';
import { MakeOptional } from "../../utils/changeProperties";
import { Game, GameState } from '../../models/game';
import { PlayerState, Player } from '../../models/player';
import { initDictionary } from "../dictionary";
import { Constants } from "../constants";

export const currentTime = observable.box(0);

export class SuperGhostGame extends Game {
  @observable superGhost: boolean = true; // if false, you can only add at the end

  @observable currentFragment: string = ''; // the word so far
  @observable startTurnTime: number = 0; // when the turn started
  @observable messageToCurrentPlayer: string = '';
  @observable playerEvents: { [playerId: string]: string } = {};
  @observable challenger: MakeOptional<Player>;
  @observable challenged: MakeOptional<Player>;
  @observable winsPerPlayer: { [playerId: string]: { name: string, wins: number } } = {};

  constructor(src?: MakeOptional<SuperGhostGame>) {
    super(src);
    initDictionary();
    if (!src) {
      this.resetGame();
    }

    if (!currentTime.get()) {
      currentTime.set(new Date().getTime());
      setInterval(() => {
        currentTime.set(new Date().getTime());
      }, 50);
    }

    // handle timeout
    reaction(() => ({
      currentTime: currentTime.get(),
      startTurnTime: this.startTurnTime,
      currentPlayer: this.currentPlayer
    }),
      ({ currentTime, startTurnTime, currentPlayer }) => {
        if ((this.gameState === GameState.Started)
          && currentPlayer
          && ((currentTime - startTurnTime) > (Constants.MaxSecondsPerTurn * 1000))) {
          this.handlePlayerOutOfTime();
        }
      }, { delay: 100 });
  }

  assign(data: object) {
    super.assign(data);
    if (!this.currentPlayer && this.gameState === GameState.Started) {
      this.gameState = GameState.NotStarted;
    }
  }

  resetGame() {
    this.gameState = GameState.NotStarted;
    this.currentFragment = '';
    this.messageToCurrentPlayer = '';
    this.challenger = this.challenged = {};
    this.playerEvents = {};
    this.startTurnTime = new Date().getTime();
    this.turnDirection = 1;
  }

  startGame() {
    this.resetGame();
    super.startGame();
    // Object.values(this.players).forEach(player => {
    //   player.state = PlayerState.Playing;
    // });
  }

  @computed get showAttendeeList() {
    return this.gameState !== GameState.Started;
  }

  @computed get challengeInProgress() {
    return !!this.challenger?.playerName;
  }

  @action startTurn() {
    this.startTurnTime = new Date().getTime();
    this.messageToCurrentPlayer = '';

    if (this.currentPlayer.state === PlayerState.Playing) {
      this.playerEvents[this.currentPlayer.playerId] = '';
    }
  }

  @action async handlePlayerAddedLetter(newWord: string) {
    const dictionary = await initDictionary();

    if (newWord.length !== (this.currentFragment.length + 1)) {
      console.error('new word must be one letter longer than current word');
    }
    if (!newWord.includes(this.currentFragment)) {
      console.error('new word must contain current word');
    }

    if (newWord.length >= Constants.MinLettersForSpellCheck && dictionary.checkWord(newWord)) {
      // it's in the dictionary, so illegal move
      this.messageToCurrentPlayer = `"${newWord}" is a word. Try again!`;
      return false;
    } else {
      this.playerEvents[this.currentPlayer.playerId] = ` played "${newWord}"`
      this.currentFragment = newWord;
      this.endTurn();
    }
  }


  @action.bound handlePlayerOutOfTime() {
    const { currentPlayer, playerEvents } = this;
    if (currentPlayer) {
      playerEvents[currentPlayer.playerId] = ' ran out of time!';
      currentPlayer.state = PlayerState.Eliminated;
      this.challenger = this.challenged = {};
      this.endTurn();
    }
  }

  @action.bound handleChallenge() {
    if (this.previousPlayer && this.currentPlayer) {

      this.challenger = new Player(this.currentPlayer);
      this.challenged = new Player(this.previousPlayer);

      this.turnDirection = -1;
      this.endTurn();

      this.playerEvents[this.challenger.playerId] = ` has challenged "${this.currentFragment}"`;
      this.playerEvents[this.challenged.playerId] = ` faces a challenge!`;
    }
  }

  @action async handleChangeChallengeText(val: string) {
    const dictionary = await initDictionary();
    if (!val.includes(this.currentFragment.toUpperCase())) {
      this.messageToCurrentPlayer = `Enter a legal word containing "${this.currentFragment.toUpperCase()}" to beat the challenge!`;
    } else if (val.length > this.currentFragment.length) {
      if (dictionary.checkWord(val)) {

        // if (checkWord(val)) {
        this.previousPlayer.state = PlayerState.Eliminated;
        this.turnDirection = 1;
        this.endTurn();
        this.playerEvents[this.challenged.playerId] = 'beat a challenge!';
        this.playerEvents[this.challenger.playerId] = `lost a challenge to ${this.challenged.playerName}!`;
        this.challenged = this.challenger = {};
      } else {
        this.messageToCurrentPlayer = `${val.toUpperCase()} is not a word. Try again.`;
      }
    }
  }

  @action resign() {
    this.currentPlayer.state = PlayerState.Eliminated;
    this.playerEvents[this.currentPlayer.playerId] = ' resigned!';
    this.endTurn();
  }

  @action endTurn() {

    super.endTurn();
    if (this.winningPlayer) {
      const { playerId, playerName } = this.winningPlayer;
      this.gameState = GameState.PlayAgain;
      const wins = this.winsPerPlayer[playerId]?.wins || 0;
      this.winsPerPlayer[playerId] = { name: playerName, wins: (wins + 1) };
    }
  }

}
