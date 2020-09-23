import { reaction } from 'mobx';
import { observer } from 'mobx-react';
import React, { useCallback, useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import ReactDice from 'react-dice-complete';
import 'react-dice-complete/dist/react-dice-complete.css';
import { useStores } from '../hooks/useStores';
import { GameState } from '../models/gameModel';
import { Player, PlayerState, PlayerType } from '../models/player';
import { UtilGraphics } from '../utils/UtilsGraphics';
import DeckContainer from './components/DeckContainer';
import HexGameBoard from './components/HexGameBoard';
import { AudioType, godotAudioUtil } from './GodotAudioUtil';
import { GodotConstants } from './GodotConstants';
import { GodotGameController } from './GodotGameController';
import { GodotGameModel, TurnPhase } from './GodotGameModel';
import './GodotGameView.scss';
import GodotBackground from './WaitingForGodot.svg';
import { UtilRandom } from '../utils/UtilsRandom';


const notStartedStyle: React.CSSProperties = {
  backgroundImage: GodotBackground
};

const GodotGameView = () => {
  const { userStore, roomStore, gameStore } = useStores();
  const { currentRoom } = roomStore;
  let { user } = userStore;
  const currentGame = gameStore.currentGame as GodotGameModel;
  const controller = gameStore.controller as GodotGameController;

  if (!user || !currentRoom.firebaseBacked) {
    user = {
      uid: '1'
    } as any;
  }
  const [musicStarted, setMusicStarted] = useState(false);

  const handleClickStartGame = useCallback(() => {
    controller.startGame();
  }, [controller]);

  if (!currentGame) {
    return null;
  }

  return (
    <Card className='GodotGameView'>

      {/* Game is not started, show instructions */}

      {(currentGame.gameState === GameState.NotStarted) &&

        <div style={notStartedStyle}>
          <GodotInstructions></GodotInstructions>
        </div>}


      {roomStore.currentUserIsWaitingToBeAdmitted && <h1>The host has not let you in yet.</h1>}

      {(!roomStore.currentUserIsWaitingToBeAdmitted) && <>

        {(currentGame.gameState === GameState.NotStarted) && <>
          {controller.canStartGame && roomStore.currentUserIsRoomHost &&
            <Button onClick={handleClickStartGame}>Start Game</Button>
          }
          {!controller.canStartGame && <>
            <h1>Waiting for more players...</h1>
            <h3><i>Click "Join" to add another player who will play on this device.</i></h3>
          </>
          }
        </>}

        {/* Play again state, show summary */}
        {(currentGame.gameState === GameState.PlayAgain) &&
          <Card>
            <p>You ran out of cards and didn't meet Godot.</p>
            {controller.canStartGame &&
              <Button onClick={handleClickStartGame}>Play again?</Button>
            }
          </Card>
        }

        {/* Game is running */}
        {(currentGame.gameState === GameState.Started) &&
          <GodotRunningGame
            currentGame={currentGame}
            controller={controller}
            user={user}></GodotRunningGame>}
      </>}
      <h4>Ambient wind sound by http://www.nsstudiosweb.com/.</h4>
    </Card>);
}

const GodotInstructions = () => (
  <>
    <h1>Waiting for Godot</h1>
    <p>At last, Samuel Becket's <a href='https://www.napavalley.edu/people/LYanover/Documents/English%20121/English%20121%20Samuel%20%20Beckett%20Waiting%20for%20Godot.pdf?fbclid=IwAR3uOI3hlz8ongeh94pzEnyBFAciRzXiTmxTK1QvfXlev9cFSI_arkIaTNQ'>
      absurdist play</a> is a board game! Enjoy, if you enjoy this sort of thing.</p>
  </>
);

const GodotRunningGame = observer((props: {
  currentGame: GodotGameModel,
  user: firebase.User,
  controller: GodotGameController
}) => {

  const { currentGame, user, controller } = props;

  const [currentPawnStyle, setCurrentPawnStyle] = useState<React.CSSProperties>({});

  let currentPlayerState = currentGame.playerStates[currentGame.currentPlayer.playerId];
  if (!currentPlayerState) {
    currentPlayerState = controller.initPlayerState();
  }

  const [style, setStyle] = useState({ transform: 'scale(0)' });


  const adjustScaling = () => {
    const contentWidth = 620;
    const contentHeight = 540;

    const scaleX = window.innerWidth / contentWidth;
    const scaleY = window.innerHeight / contentHeight;
    const scale = Math.min(scaleX, scaleY);
    const transform = `scale(${scale})`;
    if (style.transform !== transform) {
      setStyle({ transform });
    }
  };

  useEffect(() => {
    const startMusic = () => {
      godotAudioUtil.playMusic(AudioType.MUSIC_GAME);
      window.removeEventListener('mousedown', startMusic, true);
    };
    window.addEventListener('mousedown', startMusic, true);
    adjustScaling();

    window.addEventListener('resize', adjustScaling);

    return () => {
      window.removeEventListener('resize', adjustScaling);
    };
  });

  useEffect(() => {

    const canceller = reaction(() => ({ phase: currentPlayerState.phase }),
      ({ phase }) => {

        if (phase === TurnPhase.moving && currentPlayerState.movePath?.length) {
          let startMoveTime = new Date().getTime();
          let pawnBoardPos = currentGame.playerBoardPositions[currentGame.currentPlayer.playerId];
          let pawnPos = getPawnPositionFromBoardPos(pawnBoardPos, currentGame.currentPlayer.playerId);
          let movePathIndex = 0;
          let lastBoardPos = currentPlayerState.movePath[movePathIndex++]; //currentPlayerState.movePath[0];
          let nextPos = getPawnPositionFromBoardPos(lastBoardPos, currentGame.currentPlayer.playerId);

          const animate = () => {
            const moveDuration = 500;
            const currentTime = new Date().getTime();
            const elapsedTime = currentTime - startMoveTime;
            const f1 = Math.min(1, elapsedTime / moveDuration);
            const f2 = 1 - f1;

            let x = pawnPos.x * f2 + nextPos.x * f1;
            let y = pawnPos.y * f2 + nextPos.y * f1 - (1.0 - (f1 * 2 - 1) * (f1 * 2 - 1)) * 20;
            setCurrentPawnStyle({
              transform: `translate(${x}px,${y}px)`
            });

            if (elapsedTime > moveDuration) {
              console.log('pawn arrived at board target, currentPlayerState.movePath = ' + JSON.stringify(currentPlayerState.movePath));
              godotAudioUtil.playSoundEffect(AudioType.SFX_THUD);
              startMoveTime = currentTime;
              if (movePathIndex === currentPlayerState.movePath.length) {
                controller.handlePlayerArrivedAtPos(lastBoardPos);
                setCurrentPawnStyle({});
                return;
              } else {
                pawnPos = nextPos;
                lastBoardPos = currentPlayerState.movePath[movePathIndex++]; //shiftMovePath();
                // lastBoardPos = currentPlayerState.movePath[0];
                nextPos = getPawnPositionFromBoardPos(lastBoardPos, currentGame.currentPlayer.playerId);
                // currentPlayerState.movePath.shift();
              }
            }
            requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      });
    return () => {
      canceller();
    };
  } /*, [currentPlayerState] */);


  const handleClickStartGame = useCallback(() => {
    controller.startGame();
  }, [controller]);

  const handleClickRoll = useCallback(() => {
    controller.rollDie();
  }, [controller]);

  const handleClickMoveTarget = useCallback((pos: number) => {
    controller.movePlayerToPos(pos);
  }, [controller]);

  const rollDoneCallback = useCallback((val: number) => {
    // window.setTimeout(() => {

    currentPlayerState.phase = TurnPhase.needMove;
    // setRolling(false);
    // }, 1000);
  }, [currentPlayerState]);

  const refCallBack = useCallback((val: any) => {
    // debugger;
    if (val?.rollAll) {

      val.rollAll([currentPlayerState.dieRoll]);
    }
  }, [currentPlayerState]);

  const getPawnPositionFromBoardPos = (position: number, playerId: string): { x: number, y: number } => {
    const slot = controller.boardSlots[position];
    if (!slot) {
      debugger;
    }
    const pos = UtilGraphics.getHexagonCenter(slot.col, slot.row, GodotConstants.cellRadius);

    const playerIdsOnSlot = Object.keys(currentGame.playerBoardPositions)
      .filter(playerId => (currentGame.playerBoardPositions[playerId] === position));

    const pawnWidth = 10;
    if (playerIdsOnSlot.length > 1) {
      pos.x -= ((playerIdsOnSlot.length - 1) * pawnWidth) / 2;
      pos.x += playerIdsOnSlot.indexOf(playerId) * pawnWidth;
    }
    return pos;
  };

  const getPawnStyle = (index) => {

    const playerId = currentGame.playerArray[index].playerId;
    const position = currentGame.playerBoardPositions[playerId] || 0;
    const pos = getPawnPositionFromBoardPos(position, playerId);

    return {
      transform: `translate(${pos.x}px,${pos.y}px)`
    };
  }

  const getPlayerClassName = (player: Player) => {
    if (player.state === PlayerState.Eliminated) {
      return 'player-eliminated';
    } else if (player === currentGame.currentPlayer) {
      return 'current-player';
    }
    return '';
  };

  return (
    <div className='playing' style={style}>
      <img src={GodotBackground}></img>
      <HexGameBoard
        cellRadius={20}
        slots={controller.boardSlots}
        movePaths={controller.moveOptions}
        onClickMoveTarget={handleClickMoveTarget}
      ></HexGameBoard>

      {/* the pawns for the non-current player */}
      {currentGame.playerArray.map((player, index) =>
        <div key={player.playerId}
          className={`pawn pawn${index} ${(player === currentGame.currentPlayer) ? 'glow' : ''}`}
          style={(player === currentGame.currentPlayer && Object.keys(currentPawnStyle).length) ? currentPawnStyle : getPawnStyle(index)}>
        </div>)
      }

      <ListGroup as="ul" className='playerList'>
        {/* <p>currentGame.currentPlayer = {JSON.stringify(currentGame.currentPlayer)}</p> */}
        {currentGame.playerArray.map((player, playerIndex) =>
          <ListGroup.Item as="li" key={player.playerId} className={getPlayerClassName(player)}>
            <Card.Header>

              <label>  <div
                className={`pawn pawn${playerIndex}`}></div>&nbsp;&nbsp;&nbsp;&nbsp;
                {player.playerName} {player.awol && <i>(left room)</i>}</label>

            </Card.Header>

            {/* Show the game controls only if the current player's account matches the authenticated user */}
            {currentGame.currentPlayer
              && currentGame.currentPlayer.playerId === player.playerId
              && currentGame.currentPlayer.uid === user.uid &&
              <Card>
                <span>
                  {(currentPlayerState.phase === TurnPhase.needRoll)
                    && (currentGame.currentPlayer.type === PlayerType.Human)
                    && (currentGame.currentPlayer.playerId === player.playerId)
                    && <Button variant='dark' onClick={handleClickRoll}>Roll</Button>}

                  {(currentPlayerState.phase === TurnPhase.rolling || currentPlayerState.phase === TurnPhase.needMove)
                    && (currentPlayerState.showDice)
                    && <ReactDice
                      numDice={1}
                      rollTime={2}

                      dieSize={60}
                      faceColor='#e0e0c0'
                      dotColor='#000000'
                      rollDone={rollDoneCallback}
                      disableIndividual={true}
                      ref={refCallBack} /* dice => this.reactDice = dice} */
                    />}

                  {(currentPlayerState.phase === TurnPhase.needMove)
                    && (currentGame.currentPlayer.playerId === player.playerId)
                    && (currentGame.currentPlayer.type === PlayerType.Human)
                    && <i>Click on the board to move</i>}
                  {(currentPlayerState.flippedCard)
                    && (currentGame.currentPlayer.type === PlayerType.Human)
                    && <i>Click on the card to continue</i>}
                </span>
              </Card>}



          </ListGroup.Item>
        )}
      </ListGroup>


      <div className='card-container'>
        <DeckContainer
          currentGame={currentGame}
          flippedCardDeck={currentPlayerState.flippedDeck}
          flippedCard={currentPlayerState.flippedCard}
          flippedCardAction={currentPlayerState.flippedCardAction}
          onClickCard={controller.handleClickCard} />

        {/* <Button onClick={controller.handleResetGame}>Reset Game</Button><br></br> */}
      </div>

    </div>
  )
});

export default observer(GodotGameView);
