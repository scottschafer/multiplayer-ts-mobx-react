import { faExclamationTriangle, faCopy } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { observer } from 'mobx-react';
import * as React from 'react';
import { useCallback } from 'react';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import { Link } from 'react-router-dom';
import { firebaseApp } from '../firebase/firebaseApp';
import { useStores } from '../hooks/useStores';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import './LandingPage.scss';


const LandingPage = observer(() => {

  const { config, userStore, roomStore } = useStores();
  const [copied, setCopied] = React.useState(false);
  const [singlePlayer, setSinglePlayer] = React.useState(false);

  const handleClickPlayAsSinglePlayer = useCallback(
    () => {
      roomStore.playAsSinglePlayer();
      setSinglePlayer(true);
    }, [roomStore]);

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

        {config.factory.renderLandingPageTitle()}

        {config.allowSinglePlayer && <>
          <div className='game-type-label'>Single Player Options</div>
          <h2>
            <Link to='/room/singleplayer'>
              <Button /* onClick={handleClickPlayAsSinglePlayer} */>Play as single player</Button></Link>
          </h2>
          <br />
        </>}

        {/* Join a room */}
        <div className='game-type-label'>Multiplayer Options</div>
        {!roomStore.createdJoinCode && <h2>To join a room, enter code here:<br />
          <input
            className={'input-room-code ' + (enteredJoinCode.length ? 'uppercase' : '')}
            value={enteredJoinCode}
            placeholder='Room code'
            onChange={handleChangeInputJoinRoom}></input><br />
          {joinCodeError && <span><FontAwesomeIcon icon={faExclamationTriangle} /> Room not found!</span>}
          {joinCodeLink && <Link to={joinCodeLink}>Join room</Link>}
        </h2>}


        {/* Create a room */}
        {!roomStore.createdJoinCode &&
          <>
            <h2>
              or
            </h2>
            <h2>
              <Button onClick={handleClickAddRoom}>Create New Room</Button>
              <br />
            </h2>
          </>}
        {roomStore.createdJoinCode &&
          <>
            <h2>Created room code:<label className='new-room-code'>{roomStore.createdJoinCode}</label></h2>

            <h2><Link to={`${roomStore.relativeCreatedRoomUrl}`}>Join room now</Link>&nbsp;</h2>
            <CopyToClipboard text={roomStore.absoluteCreatedRoomUrl}
              onCopy={() => setCopied(true)}>
              <Button><FontAwesomeIcon icon={faCopy}></FontAwesomeIcon> Copy link to room</Button>
            </CopyToClipboard>
            {copied ? <p style={{ color: 'red' }}>Link copied to clipboard - now share it with your friends</p> : null}

          </>}
      </Container>
    </>
  );
});

export default LandingPage;
