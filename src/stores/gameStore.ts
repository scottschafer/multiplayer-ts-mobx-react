import { computed, reaction, action, toJS } from 'mobx';
import { SynchronizedModelRunner, LoadingState } from '../synchronization/synchronizedModelRunner';
import { Game, GameState } from '../models/game';
import { MakeOptional, MakeWritable } from '../utils/changeProperties';
import { RootStore } from './rootStore';
import { Player, PlayerState } from '../models/player';
// import { GlobalGameConfig } from '../GameConfig';

export class GameStore {

  // Automatically load and save the game (magic!)
  private readonly gameModelRunner = new SynchronizedModelRunner<Game>(this.rootStore.config.factory.gameModelFactory, 'games');
  private localGame: Game = null;

  @computed get currentGame() {
    if (this.localGame) {
      return this.localGame;
    }
    return this.gameModelRunner.model;
  }

  @computed get loadingState() {
    if (this.localGame) {
      return LoadingState.Loaded;
    }
    return this.gameModelRunner.loadingState;
  }

  @action.bound joinGame(player: Player) {
    const { currentGame } = this;

    if (currentGame.players[player.playerId]) {
      // if this player is already in the game, create a new player
      const playerNames = new Set<String>(Object.values(currentGame.players).map(user => user.playerName));

      // get a unique name (which can be changed)
      let playerName = player.displayName;
      for (let index = 1; true; index++) {
        playerName = player.playerName;
        if (index > 1) {
          playerName += ' #' + index;
        }
        if (!playerNames.has(playerName)) {
          break;
        }
      }
      let newPlayerId = player.uid;
      for (let index = 1; true; index++) {
        newPlayerId = `${player.uid}_${index}`;
        if (!currentGame.players[newPlayerId]) {
          break;
        }
      }

      const srcNewPlayer = { ...player };
      srcNewPlayer.playerId = newPlayerId;
      srcNewPlayer.playerName = playerName;
      player = new Player(srcNewPlayer);
    }


    this.currentGame.addPlayer(player);
  }

  @action.bound leaveGame(playerToLeave: Player) {
    this.currentGame.removePlayer(playerToLeave);
  }

  constructor(public readonly rootStore: RootStore) {

    // automatically load the game associated with the current room
    reaction(() => this.rootStore.roomStore.currentRoom,
      currentRoom => {
        if (currentRoom) {
          this.gameModelRunner.key = currentRoom.gameKey;
        }
      });

    reaction(() => ({
      usersInRoom: toJS(this.rootStore.roomStore.currentRoom?.usersInRoom)
    }),
      ({ usersInRoom }) => {
        if (this.currentGame) {
          Object.values(this.currentGame.players).forEach(player => {
            if (!usersInRoom[player.uid]) {
              player.state = PlayerState.AWOL;
            } else {
              if (player.state === PlayerState.AWOL) {
                player.state = PlayerState.Playing;
              }
            }
          })
        }
      },
      { delay: 100 });

    // if the game can't be started
    reaction(() => ({
      canStartGame: this.currentGame?.canStartGame
    }), ({ canStartGame }) => {
      if (!canStartGame) {
        if (this.currentGame?.gameState === GameState.PlayAgain) {
          this.currentGame.gameState = GameState.NotStarted;
        }
      }
    });
  }

  createGame(params?: MakeOptional<Game>) {
    return new this.rootStore.config.factory.gameModelFactory(params);
  }

  private get asWriteable() {
    return this as MakeWritable<GameStore>;
  }

}
