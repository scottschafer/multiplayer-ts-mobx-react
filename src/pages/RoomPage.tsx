import * as H from 'history';
import { observer } from 'mobx-react';
import React from 'react';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import { Link, Prompt } from 'react-router-dom';
import Attendees from '../components/Attendees';
import { Routes } from '../constants/routes';
import { useStores } from '../hooks/useStores';
import { LoadingState } from '../synchronization/synchronizedModelRunner';


const RoomPage = observer(() => {

  const { config, userStore, roomStore, gameStore } = useStores();

  const { user } = userStore;

  const currentRoom = roomStore.currentRoom;
  const currentGame = gameStore.currentGame;
  const currentGameController = gameStore.controller;

  if (!currentGame || !currentRoom) {
    return null;
  }

  if (!user && currentRoom.firebaseBacked) {
    userStore.requireAuthentication();
    return null;
  }

  return (
    <Container fluid>

      {/* user && */
        <>

          {/* Handle when leaving room */}
          <Prompt
            message={
              (location: H.Location, action: H.Action) => {
                roomStore.handleLeaveRoom();
                return true;
              }}></Prompt>

          {(roomStore.loadingState === LoadingState.Loading) && <p>loading...</p>}
          {(roomStore.loadingState === LoadingState.NotFound) && <h1>
            Room not found! <Link to={Routes.LANDING}>X</Link>
          </h1>}


          {(roomStore.loadingState === LoadingState.Loaded && currentRoom) &&
            <Row>
              <Col>
                {currentGame && config.factory.gameViewFactory()}
              </Col>
              {currentGameController?.showAttendeeList && user &&
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
