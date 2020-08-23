import { observer } from 'mobx-react';
import React, { ChangeEvent, useCallback, useState } from 'react';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'

import { useStores } from '../hooks/useStores';
import { GameState } from '../models/gameModel';
import { Constants } from './constants';
import { SuperGhostGameModel } from './superGhostGameModel';
import { Player, PlayerState } from '../models/player';

import TimeOutBar from './components/TimeOutBar';
import ListGroup from 'react-bootstrap/esm/ListGroup';

import { SuperGhostGameController } from './superGhostGameController';
import './SuperGhostGameView.scss';

const SuperGhostGameView = () => {
  const { userStore, roomStore, gameStore } = useStores();
  const { user } = userStore;
  const currentGame = gameStore.currentGame as SuperGhostGameModel;
  const controller = gameStore.controller as SuperGhostGameController;

  const handleClickStartGame = useCallback(() => {
    controller.startGame();
  }, [controller]);

  if (!currentGame) {
    return null;
  }

  return (
    <Card className='SuperGhostGamePage'>
      {/* Game is not started, show instructions */}
      {(currentGame.gameState === GameState.NotStarted) && <SuperGhostInstructions></SuperGhostInstructions>}


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
            {controller.winningPlayer && <h1>{controller.winningPlayer.playerName} wins!</h1>}
            <table>
              <tbody>
                <tr>
                  <th>Player</th><th># wins</th>
                </tr>
                {Object.keys(currentGame.winsPerPlayer)
                  .sort((a, b) => (currentGame.winsPerPlayer[b].wins - currentGame.winsPerPlayer[a].wins))
                  .map(playerId =>
                    <tr key={playerId}>
                      <td>{currentGame.winsPerPlayer[playerId].name}</td>
                      <td>{currentGame.winsPerPlayer[playerId].wins}</td>
                    </tr>)}
              </tbody>
            </table>
            {controller.canStartGame &&
              <Button onClick={handleClickStartGame}>Play again?</Button>
            }
          </Card>
        }

        {/* Game is running */}
        {(currentGame.gameState === GameState.Started) &&
          <SuperGhostRunningGame
            currentGame={currentGame}
            controller={controller}
            user={user}></SuperGhostRunningGame>}
      </>}

    </Card>);

}

const SuperGhostInstructions = () => (
  <>
    <h1>Superghost</h1>
      <p>Take turns adding a letter to the beginning <b>or</b> end of a word fragment - just as long as you don't make a valid word
      that's longer than three letters.</p>

      <p>It's your turn and you can't think of any word that includes the fragment? Challenge your opponents! If any can come up with
        a valid word containing that fragment, you will lose, but if they can't - you win!</p>
  </>
);

const SuperGhostRunningGame = observer((props: {
  currentGame: SuperGhostGameModel,
  user: firebase.User,
  controller: SuperGhostGameController
}) => {


  const { currentGame, user, controller } = props;
  const [startLetter, setStartLetter] = useState('');
  const [endLetter, setEndLetter] = useState('');
  const [challengeText, setChallengeText] = useState('');
  const { currentFragment, superGhost } = currentGame;

  if (challengeText && !controller.challengeInProgress) {
    setChallengeText('');
  }

  const getLetterFromEvent = (e: ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.toUpperCase();
    val = (val >= 'A' && val <= 'Z') ? val : '';
    return val;
  }

  const handleChangeStartLetter = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const val = getLetterFromEvent(e);
    if (val) {
      controller.handlePlayerAddedLetter(val + currentGame.currentFragment);
    }
    setStartLetter('');
  }, [controller, currentGame, setStartLetter]);

  const handleChangeEndLetter = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const val = getLetterFromEvent(e);
    if (val) {
      controller.handlePlayerAddedLetter(currentGame.currentFragment + val);
    }
    setEndLetter('');
  }, [controller, currentGame, setEndLetter]);

  const handleChangeChallengeText = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setChallengeText(val);
    controller.handleChangeChallengeText(val);
  }, [controller, setChallengeText]);

  const handleClickResign = useCallback(() => {
    controller.resign();
  }, [controller]);

  const handleClickChallenge = useCallback(() => {
    controller.handleChallenge();
  }, [controller]);

  const getPlayerClassName = (player: Player) => {
    if (player.state === PlayerState.Eliminated) {
      return 'player-eliminated';
    } else if (player === currentGame.currentPlayer) {
      return 'current-player';
    }
    return '';
  };

  return (
    <div className='playing'>
      <TimeOutBar
        running={true}
        currentTime={controller.currentTime}
        startTime={currentGame.startTurnTime}
        timeoutDuration={Constants.MaxSecondsPerTurn * 1000}></TimeOutBar>


      <ListGroup as="ul">
        {currentGame.playerArray.map(player =>
          <ListGroup.Item as="li" key={player.playerId} className={getPlayerClassName(player)}>
            <Card.Header>
              {(player.state === PlayerState.Eliminated) && <FontAwesomeIcon icon={faTimes} />}
              <label>{player.playerName} {player.awol && <i>(left room)</i>}</label>
              <h3>{currentGame.playerEvents[player.playerId]}</h3>

              {currentGame.currentPlayer
                && currentGame.currentPlayer.playerId === player.playerId
                && currentGame.currentPlayer.uid !== user.uid &&
                <h4>
                  {(!currentGame.currentPlayer.awol) &&
                    <i>Turn in progress - please wait.</i>}
                  {(currentGame.currentPlayer.awol) &&
                    <span>
                      Player has left the room.
                      
                      
                      </span>}
                </h4>}

            </Card.Header>

            {/* Show the game controls only if the current player's account matches the authenticated user */}
            {currentGame.currentPlayer
              && currentGame.currentPlayer.playerId === player.playerId
              && currentGame.currentPlayer.uid === user.uid &&
              <Card>
                {!controller.challengeInProgress &&
                  <>
                    <div>
                      <span className='playerInputContainer'>
                        {(superGhost && currentFragment.length > 0)
                          && <input maxLength={1} placeholder='_'
                            onChange={handleChangeStartLetter}
                            value={startLetter}></input>}

                        {currentFragment ? currentFragment : <span>&nbsp;</span>}

                        <input maxLength={1} placeholder='_'
                          autoFocus={true}
                          onChange={handleChangeEndLetter}
                          value={endLetter}></input>

                      </span>
                      <span className='inputHelp'>
                        {currentFragment ? 'Add a letter to the beginning or end.' : 'Type a letter to get started.'}
                      </span>
                    </div>

                    {currentGame.messageToCurrentPlayer && <p>{currentGame.messageToCurrentPlayer}</p>}
                    {currentFragment.length >= 3 && <Button variant='warning' onClick={handleClickChallenge}>Challenge</Button>}
                  </>
                }

                {controller.challengeInProgress && <>
                  <input value={challengeText}
                    onChange={handleChangeChallengeText}
                    placeholder={`word containing ${currentGame.currentFragment}`}
                  ></input>
                </>}


                {currentFragment.length >= 3 &&
                  <Button variant='danger' onClick={handleClickResign}>I give up!</Button>}

                {controller.challengeInProgress && <p>You were challenged by {currentGame.challenger.playerName}. To
                beat the challenge, type a word containing {currentGame.currentFragment}.</p>}

              </Card>}



          </ListGroup.Item>
        )}
      </ListGroup>

    </div>
  )
});

export default observer(SuperGhostGameView);
