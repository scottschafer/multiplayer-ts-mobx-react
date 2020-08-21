import * as H from 'history';
import { observer } from 'mobx-react';
import React from 'react';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import { Link, Prompt, useParams } from 'react-router-dom';
import Attendees from '../components/Attendees';
import { Routes } from '../constants/routes';
// import { GlobalGameConfig } from '../GameConfig';
import { useStores } from '../hooks/useStores';
import { LoadingState } from '../synchronization/syncrhonizedModelWatcher';
import SignInPage from './SignInPage';


const RoomPage = observer(() => {

  const { config, userStore, roomStore, gameStore } = useStores();
  const params = useParams<{ id: string }>();

  const { user } = userStore;

  const currentRoom = roomStore.currentRoom;
  const currentGame = gameStore.currentGame;
  roomStore.setCurrentJoinCode(params.id);

  return (
    <Container fluid>

      {!user && !userStore.waitingToAuthenticate && <>
        <Container>
          <SignInPage></SignInPage>
        </Container>
      </>}

      {user && <>

        {/* Handle when leaving room */}
        <Prompt
          message={
            (location: H.Location, action: H.Action) => {
              roomStore.handleLeaveRoomPage();
              return true;
            }}></Prompt>

        {(roomStore.loadingState === LoadingState.Loading) && <p>loading...</p>}
        {(roomStore.loadingState === LoadingState.NotFound) && <h1>
          Room not found! <Link to={Routes.LANDING}>X</Link>
        </h1>}


        {(roomStore.loadingState === LoadingState.Loaded && currentRoom) &&
          <Row>
            <Col>
              {currentGame && config.factory.renderGame()}
            </Col>
            {currentGame?.showAttendeeList &&
              <Col xs="auto">
                <Attendees
                  room={currentRoom}
                  game={currentGame}
                  currentUser={userStore.user}
                  onClickSignOut={userStore.signOut}
                  onClickJoinGame={gameStore.joinGame}
                  onClickLeaveGame={gameStore.leaveGame}
                  onClickAdmitUser={roomStore.admitUser}
                  onClickBlockUser={roomStore.blockUser}
                  onClickUnblockUser={roomStore.unblockUser}
                  onClickEjectUser={roomStore.ejectUser}
                ></Attendees>
              </Col>}

          </Row>}
      </>}
    </Container>
  );
});

export default RoomPage;
