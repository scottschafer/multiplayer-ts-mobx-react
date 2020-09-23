import { action, computed, reaction, toJS, observable } from 'mobx';
import { IGameController } from '../controllers/gameController';
import { getConfig } from '../config/GameConfig';
import { GameModel, GameState } from '../models/gameModel';
import { Player } from '../models/player';
import { LoadingState, SynchronizedModelRunner } from '../synchronization/synchronizedModelRunner';
import { MakeOptional, MakeWritable } from '../utils/changeProperties';
import { RootStore } from './rootStore';

export class GameStore {

  readonly controller: IGameController;

  // Automatically load and save the game (magic!)
  private readonly gameModelRunner = new SynchronizedModelRunner<GameModel>(this.rootStore.config.factory.gameModelFactory, 'games');
  @observable.ref readonly localGame: GameModel = null;

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

  @action setLocalGame(game: GameModel) {
    this.asWriteable.localGame = game;
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


    this.controller.addPlayer(player);
  }

  @action.bound leaveGame(playerToLeave: Player) {
    this.controller.removePlayer(playerToLeave);
  }

  constructor(public readonly rootStore: RootStore) {

    reaction(() => ({
      game: this.currentGame
    }),
      ({ game }) => {
        if (this.controller) {
          this.controller.cleanup();
          this.asWriteable.controller = null;
        }
        if (game) {
          this.asWriteable.controller = getConfig().factory.gameControllerFactory(game);
          if (this.rootStore.roomStore.currentRoom && !this.rootStore.roomStore.currentRoom.firebaseBacked) {
            this.controller.startGame();
          }
        }
      });

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
            if (this.rootStore.roomStore.currentRoom?.firebaseBacked === false) {
              player.awol = false;
            } else {
              player.awol = !usersInRoom[player.uid];
            }
          });
        }
      },
      { delay: 100 });

    // if the game can't be started
    reaction(() => ({
      canStartGame: this.controller?.canStartGame
    }), ({ canStartGame }) => {
      if (!canStartGame) {
        if (this.currentGame?.gameState === GameState.PlayAgain) {
          this.currentGame.gameState = GameState.NotStarted;
        }
      }
    });
  }

  createGame(params?: MakeOptional<GameModel>) {
    return new this.rootStore.config.factory.gameModelFactory(params);
  }

  private get asWriteable() {
    return this as MakeWritable<GameStore>;
  }

}
