import { observer } from 'mobx-react';
import * as React from 'react';
import { useCallback, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import { Link } from 'react-router-dom';
import withFirebaseAuth, { WrappedComponentProps } from 'react-with-firebase-auth';
import { Routes } from '../constants/routes';
import { firebaseApp, firebaseAppAuth } from '../firebase/firebaseApp';
import { useStores } from '../hooks/useStores';
import { GlobalGameConfig } from '../GameConfig';


const LandingPage = observer(({ user, signOut }: WrappedComponentProps) => {

  const { userStore, roomStore } = useStores();
  const [joinRoomCode, setJoinRoomCode] = useState('');

  userStore.setUser(user);

  const handleClickAddRoom = useCallback(
    () => {
      roomStore.createNewRoom() // .addNewRoom(roomName)
    }, [roomStore]); //[roomName]);

  const handleChangeInputJoinRoom = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setJoinRoomCode(e.target.value);
    }, []);

  const handleClickEraseDB = useCallback(
    () => {
      const database = firebaseApp.database();
      database.ref('rooms').remove();
      database.ref('joinCodes').remove();
      database.ref('chats').remove();
      database.ref('games').remove();
      alert('Database has been erased!');
    }, []);

  return (
    <>
      <Container>
        {GlobalGameConfig.config.showEraseDB &&
          <p>
            <Button onClick={handleClickEraseDB}>Erase Database</Button>
          </p>}

        {userStore.user && <div>
          Welcome back, {userStore.user.displayName}
          <button onClick={signOut}>Sign out</button>
        </div>}

        {!userStore.user &&
          <Link to={Routes.SIGN_IN}>Sign in</Link>}

        {/* Join a room */}
        <div>
          <h1>Join a room</h1>
          <input
            value={joinRoomCode}
            placeholder='Enter room code'
            onChange={handleChangeInputJoinRoom}></input>
          <Link to={`room\${joinRoomCode}`}>Go</Link>
          {/* <button onClick={handleClickJoin}>Join</button> */}
        </div>

        {/* Create a room */}
        {userStore.user && <>
          <h1>Create room</h1>
          <p>
            {!roomStore.createdJoinCode &&

              <button onClick={handleClickAddRoom}>Create Room</button>}
            {roomStore.createdJoinCode &&
              <span>Created room code:
              <label>{roomStore.createdJoinCode}</label>
                <Link to={`${Routes.ROOM.replace(':id', roomStore.createdJoinCode)}`}>Go</Link>
              </span>
            }
          </p>

          {/* <p>Rooms: {JSON.stringify(roomStore.rooms)}</p> */}
        </>}
      </Container>
    </>
  );
});


export default withFirebaseAuth({
  firebaseAppAuth,
})(LandingPage);
