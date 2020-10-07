import { reaction } from 'mobx';
import { observer } from 'mobx-react';
import React, { useCallback, useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import 'react-dice-complete/dist/react-dice-complete.css';
import { useStores } from '../hooks/useStores';
import { GameState } from '../models/gameModel';
import { AudioType, audioUtil } from './AudioUtil';
import { Constants } from './Constants';
import { BattlebotsGameController } from './BattlebotsGameController';
import { BattlebotsGameModel, TurnPhase } from './BattlebotsGameModel';
import './BattlebotsGameView.scss';
import { UtilRandom } from '../utils/UtilsRandom';
import { Canvas, useFrame } from 'react-three-fiber';
import BattlebotsRunningGame from './BattlebotsRunningGame';

const notStartedStyle: React.CSSProperties = {
  // backgroundImage: GodotBackground
};

const BattlebotsGameView = () => {
  const { userStore, roomStore, gameStore } = useStores();
  const { currentRoom } = roomStore;
  let { user } = userStore;
  const currentGame = gameStore.currentGame as BattlebotsGameModel;
  const controller = gameStore.controller as BattlebotsGameController;

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
    <Card className='BattlebotsGameView'>
      {/* Game is not started, show instructions */}

      {(currentGame.gameState === GameState.NotStarted) &&

        <div style={notStartedStyle}>
          <BattlebotsInstructions></BattlebotsInstructions>
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
            <p>You ran out of cards and didn't meet Battlebots.</p>
            {controller.canStartGame &&
              <Button onClick={handleClickStartGame}>Play again?</Button>
            }
          </Card>
        }

        {/* Game is running */}
        {(currentGame.gameState === GameState.Started) &&
          <BattlebotsRunningGame
            currentGame={currentGame}
            controller={controller}
            user={user}></BattlebotsRunningGame>}
      </>}
      <h4>Ambient wind sound by http://www.nsstudiosweb.com/.</h4>
    </Card>);
}

const BattlebotsInstructions = () => (
  <>
    <h1>Waiting for Battlebots</h1>
    <p>At last, Samuel Becket's <a href='https://www.napavalley.edu/people/LYanover/Documents/English%20121/English%20121%20Samuel%20%20Beckett%20Waiting%20for%20Battlebots.pdf?fbclid=IwAR3uOI3hlz8ongeh94pzEnyBFAciRzXiTmxTK1QvfXlev9cFSI_arkIaTNQ'>
      absurdist play</a> is a board game! Enjoy, if you enjoy this sort of thing.</p>
  </>
);

export default observer(BattlebotsGameView);
