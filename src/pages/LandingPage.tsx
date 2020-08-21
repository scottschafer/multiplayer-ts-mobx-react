import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { observer } from 'mobx-react';
import * as React from 'react';
import { useCallback } from 'react';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import { Link } from 'react-router-dom';
import { Routes } from '../constants/routes';
import { firebaseApp } from '../firebase/firebaseApp';
// import { GlobalGameConfig } from '../GameConfig';
import { useStores } from '../hooks/useStores';
import './LandingPage.scss';


const LandingPage = observer(() => {

  const { config, userStore, roomStore } = useStores();

  const handleClickAddRoom = useCallback(
    () => {
      roomStore.createNewRoom()
    }, [roomStore]);

  const handleChangeInputJoinRoom = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      roomStore.setEnteredRoomCode(e.target.value);
    }, [roomStore]);

  const handleClickEraseDB = useCallback(
    () => {
      const database = firebaseApp.database();
      database.ref('rooms').remove();
      database.ref('joinCodes').remove();
      database.ref('chats').remove();
      database.ref('games').remove();
      alert('Database has been erased!');
    }, []);

  const { enteredJoinCode, joinCodeError, joinCodeLink } = roomStore;

  return (
    <>
      <Container className='LandingPage'>

        {userStore.user && <p className='welcome-back-row'>
          Welcome back, {userStore.user.displayName}
          <Button onClick={userStore.signOut}>Sign out</Button>
          {config.config.showEraseDB &&
            <Button variant='danger' onClick={handleClickEraseDB}>Erase Database</Button>}
        </p>}

        {!userStore.user &&
          <Link to={Routes.SIGN_IN}>Sign in</Link>}

        {config.factory.renderLandingPageTitle()}
        <br />

        {/* Join a room */}
        <h2>To join a room, enter code here:<br />
          <input
            className={'input-room-code ' + (enteredJoinCode.length ? 'uppercase' : '')}
            value={enteredJoinCode}
            placeholder='Room code'
            onChange={handleChangeInputJoinRoom}></input><br />
          {joinCodeError && <span><FontAwesomeIcon icon={faExclamationTriangle} /> Room not found!</span>}
          {joinCodeLink && <Link to={joinCodeLink}>Join room</Link>}
          <br />
        </h2>

        {/* Create a room */}
        {userStore.user && <>
          <h2>
            {!roomStore.createdJoinCode &&
              <Button onClick={handleClickAddRoom}>Create New Room</Button>}
            {roomStore.createdJoinCode &&
              <span>Created room code:
              <label className='new-room-code'>{roomStore.createdJoinCode}</label><br />
                <Link to={`${Routes.ROOM.replace(':id', roomStore.createdJoinCode)}`}>Join room</Link>
              </span>}

          </h2>
        </>}
      </Container>
    </>
  );
});

export default LandingPage;
