import { User } from 'firebase';
import { observer } from 'mobx-react';
import React from 'react';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import AttendeeListItem from './AttendeeListItem';
import { Game } from '../models/game';
import { Room } from '../models/room';
import { Player } from '../models/player';
import './Attendees.scss';


export interface AttendeesProps {
  room: Room;
  game: Game;
  currentUser: User;

  onClickSignOut: () => void;

  onClickJoinGame: ((player: Player) => void);
  onClickLeaveGame: ((player: Player) => void);

  onClickAdmitUser: ((player: Player) => void);
  onClickBlockUser: ((player: Player) => void);
  onClickUnblockUser: ((player: Player) => void);
  onClickEjectUser: ((player: Player) => void);
}

const Attendees = (props: AttendeesProps) => {

  const { room, game, currentUser } = props;
  if (!room || !game) {
    return null;
  }

  const { usersWaitingToBeAdmitted, usersAdmitted, usersBlocked, hostIds } = room;
  const currentUserIsHost = hostIds.includes(props.currentUser.uid);
  const waitingToBeAdmitted = !!usersWaitingToBeAdmitted.find(user => (user.uid === props.currentUser.uid));
  const playerArray = game.playerArray;

  return (
    <Card className='Attendees'>
      {props.currentUser && <div>
        Welcome back, {props.currentUser.displayName}
        <button onClick={props.onClickSignOut}>Sign out</button>
      </div>}


      {waitingToBeAdmitted && <Card.Header>Waiting for the host to let you in</Card.Header>}
      {!waitingToBeAdmitted && <>

        {/* Players in game */}
        <Card.Header>Players</Card.Header>
        <ListGroup as="ul">
          {(!playerArray.length) && <ListGroup.Item>No players in game</ListGroup.Item>}

          {(!!playerArray.length) && playerArray.map((player, i) =>
            <AttendeeListItem
              {...props}
              index={i}
              key={'p' + player.playerId}
              player={player}
              allowLeaveButton={player.uid === currentUser.uid}
              allowEditPlayerName={player.uid === currentUser.uid}
            ></AttendeeListItem>)}
        </ListGroup >

        {/* Waiting to be admitted */}
        {!!usersWaitingToBeAdmitted.length &&
          <>
            <Card.Header>Waiting to be admitted</Card.Header>
            <ListGroup as="ul">
              {true && usersWaitingToBeAdmitted.map(player =>
                <AttendeeListItem
                  {...props}
                  key={'w' + player.playerId}
                  player={player}
                  allowAdmitButton={currentUserIsHost}
                  allowBlockButton={currentUserIsHost}
                ></AttendeeListItem>)}
            </ListGroup>
          </>}

        {/* Users in room */}
        {
          !!usersAdmitted.length &&
          <>
            <Card.Header>In room</Card.Header>
            <ListGroup as="ul">
              {usersAdmitted.map(player =>
                <AttendeeListItem
                  {...props}
                  key={'i' + player.playerId}
                  player={player}
                  allowEjectButton={currentUserIsHost}
                  allowJoinButton={(player.uid === currentUser.uid)}
                ></AttendeeListItem>)}
            </ListGroup>
          </>
        }

        {
          !!usersBlocked.length &&
          <>
            <Card.Header>Blocked</Card.Header>
            <ListGroup as="ul">
              {usersBlocked.map(player =>
                <AttendeeListItem
                  {...props}
                  key={'b' + player.playerId}
                  player={player}
                  allowUnblockButton={currentUserIsHost}
                ></AttendeeListItem>)}
            </ListGroup>
          </>
        }
      </>}
    </Card >)
};


export default observer(Attendees);
