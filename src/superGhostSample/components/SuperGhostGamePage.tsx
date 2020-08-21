import { observer } from 'mobx-react';
import React, { ChangeEvent, useCallback, useState } from 'react';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'

import { useStores } from '../../hooks/useStores';
import { GameState } from '../../models/game';
import { Constants } from '../constants';
import { currentTime, SuperGhostGame } from '../models/superGhostGame';
import { Player, PlayerState } from '../../models/player';

import TimeOutBar from './TimeOutBar';
import ListGroup from 'react-bootstrap/esm/ListGroup';

import './SuperGhostGamePage.scss';

const SuperGhostGamePage = () => {
  const { userStore, roomStore, gameStore } = useStores();

  const { user } = userStore;
  const currentGame = gameStore.currentGame as SuperGhostGame;

  const handleClickStartGame = useCallback(() => {
    currentGame.startGame();
  }, [currentGame]);

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
          {currentGame.canStartGame && roomStore.currentUserIsRoomHost &&
            <Button onClick={handleClickStartGame}>Start Game</Button>
          }
          {!currentGame.canStartGame &&
            <h1>Waiting for more players...</h1>
          }
        </>}

        {/* Play again state, show summary */}
        {(currentGame.gameState === GameState.PlayAgain) &&
          <Card>
            {currentGame.winningPlayer && <h1>{currentGame.winningPlayer.playerName} wins!</h1>}
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
            {currentGame.canStartGame &&
              <Button onClick={handleClickStartGame}>Play again?</Button>
            }
          </Card>
        }

        {/* Game is running */}
        {(currentGame.gameState === GameState.Started) &&
          <SuperGhostRunningGame
            currentGame={currentGame}
            user={user}></SuperGhostRunningGame>}
      </>}

    </Card>);

}

const SuperGhostInstructions = () => (
  <>
    <h1>Superghost</h1>
    <h3>
      <p>Take turns adding a letter to the beginning <b>or</b> end of a word fragment - just as long as you don't make a valid word
      that's longer than three letters.</p>

      <p>It's your turn and you can't think of any word that includes the fragment? Challenge your opponents! If any can come up with
        a valid word containing that fragment, you will lose, but if they can't - you win!</p>
    </h3>
  </>
);

const SuperGhostRunningGame = observer((props: {
  currentGame: SuperGhostGame,
  user: firebase.User
}) => {

  const { currentGame, user } = props;
  const [startLetter, setStartLetter] = useState('');
  const [endLetter, setEndLetter] = useState('');
  const [challengeText, setChallengeText] = useState('');
  const { currentFragment: currentWord, superGhost } = currentGame;

  if (challengeText && !currentGame.challengeInProgress) {
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
      currentGame.handlePlayerAddedLetter(val + currentGame.currentFragment);
    }
    setStartLetter('');
  }, [currentGame, setStartLetter]);

  const handleChangeEndLetter = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const val = getLetterFromEvent(e);
    if (val) {
      currentGame.handlePlayerAddedLetter(currentGame.currentFragment + val);
    }
    setEndLetter('');
  }, [currentGame, setEndLetter]);

  const handleChangeChallengeText = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setChallengeText(val);
    currentGame.handleChangeChallengeText(val);
  }, [currentGame, setChallengeText]);

  const handleClickResign = useCallback(() => {
    currentGame.resign();
  }, [currentGame]);

  const handleClickChallenge = useCallback(() => {
    currentGame.handleChallenge();
  }, [currentGame]);

  const getPlayerClassName = (player: Player) => {
    if (player.state === PlayerState.Eliminated) {
      return 'player-eliminated';
    } else if (player === currentGame.currentPlayer) {
      return 'current-player';
    }
    return '';
  };

  return (
    <>
      <TimeOutBar
        running={true}
        currentTime={currentTime.get()}
        startTime={currentGame.startTurnTime}
        timeoutDuration={Constants.MaxSecondsPerTurn * 1000}></TimeOutBar>


      <ListGroup as="ul">
        {currentGame.playerArray.map(player =>
          <ListGroup.Item as="li" key={player.playerId} className={getPlayerClassName(player)}>
            <Card.Header>
              {(player.state === PlayerState.Eliminated) && <FontAwesomeIcon icon={faTimes} />}
              <label>{player.playerName}</label>
              <h3>{currentGame.playerEvents[player.playerId]}</h3>

              {currentGame.currentPlayer
                && currentGame.currentPlayer.playerId === player.playerId
                && currentGame.currentPlayer.uid !== user.uid &&
                <h4>
                  {(currentGame.currentPlayer.state === PlayerState.Playing) &&
                    <i>Turn in progress - please wait.</i>}
                  {(currentGame.currentPlayer.state === PlayerState.AWOL) &&
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
                {!currentGame.challengeInProgress &&
                  <>
                    <div>
                      <span className='playerInputContainer'>
                        {(superGhost && currentWord.length > 0)
                          && <input maxLength={1} placeholder='_'
                            onChange={handleChangeStartLetter}
                            value={startLetter}></input>}

                        {currentWord ? currentWord : <span>&nbsp;</span>}

                        <input maxLength={1} placeholder='_'
                          autoFocus={true}
                          onChange={handleChangeEndLetter}
                          value={endLetter}></input>

                      </span>
                      <span className='inputHelp'>
                        {currentWord ? 'Add a letter to the beginning or end.' : 'Type a letter to get started.'}
                      </span>
                    </div>

                    {currentGame.messageToCurrentPlayer && <p>{currentGame.messageToCurrentPlayer}</p>}
                    {currentWord.length >= 3 && <Button variant='warning' onClick={handleClickChallenge}>Challenge</Button>}
                  </>
                }

                {currentGame.challengeInProgress && <>
                  <input value={challengeText}
                    onChange={handleChangeChallengeText}
                    placeholder={`word containing ${currentGame.currentFragment}`}
                  ></input>
                </>}


                {currentWord.length >= 3 &&
                  <Button variant='danger' onClick={handleClickResign}>I give up!</Button>}

                {currentGame.challengeInProgress && <p>You were challenged by {currentGame.challenger.playerName}. To
                beat the challenge, type a word containing {currentGame.currentFragment}.</p>}

              </Card>}



          </ListGroup.Item>
        )}
      </ListGroup>

    </>
  )
});

export default observer(SuperGhostGamePage);
