import React, { useCallback, useState, ChangeEvent } from 'react';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import { observer } from 'mobx-react';
import { AttendeesProps } from './Attendees';
import { Player } from '../models/player';
/**
 * User list item component
 */
export interface AttendeeListItemProps extends AttendeesProps {
  player?: Player;
  allowJoinButton?: boolean;
  allowLeaveButton?: boolean;
  allowAdmitButton?: boolean;
  allowBlockButton?: boolean;
  allowUnblockButton?: boolean;
  allowEjectButton?: boolean;
  allowEditPlayerName?: boolean;
  index?: number;
};

const AttendeeListItem = (props: AttendeeListItemProps) => {

  const { room, player, game, index,
    allowJoinButton, allowLeaveButton, allowAdmitButton, allowBlockButton, allowUnblockButton, allowEjectButton, allowEditPlayerName,
    onClickJoinGame, onClickLeaveGame, onClickAdmitUser, onClickBlockUser, onClickUnblockUser, onClickEjectUser
  } = props;

  const [playerName, setPlayerName] = useState(player.playerName || player.displayName);

  const handleClickJoin = useCallback(
    () => { onClickJoinGame(player); }, [player, onClickJoinGame]);

  const handleClickLeave = useCallback(
    () => { onClickLeaveGame(player); }, [player, onClickLeaveGame]);

  const handleClickAdmit = useCallback(
    () => { onClickAdmitUser(player); }, [player, onClickAdmitUser]);

  const handleClickBlock = useCallback(
    () => { onClickBlockUser(player); }, [player, onClickBlockUser]);

  const handleClickUnblock = useCallback(
    () => { onClickUnblockUser(player); }, [player, onClickUnblockUser]);

  const handleClickEject = useCallback(
    () => { onClickEjectUser(player); }, [player, onClickEjectUser]);

  const handleChangePlayerName = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => { setPlayerName(e.target.value) },
    [setPlayerName]);

  const handleBlurPlayerName = useCallback(
    () => { player.playerName = playerName },
    [player, playerName]);


  const userIsHost = room.hostIds.includes(player.uid);
  let className = 'user-description';
  if (player === game?.currentPlayer) {
    className += ' current-player';
  }

  // if (player.state === PlayerState.Eliminated) {
  //   className += ' eliminated';
  // }

  return (
    <ListGroup.Item as="li" className={className}>
      <label>
        {(index !== undefined) ? ((index + 1) + '. ') : null}
        <img alt='profile' src={player.photoURL}></img>
        {allowEditPlayerName ?
          <input
            value={playerName}
            onChange={handleChangePlayerName}
            onBlur={handleBlurPlayerName}></input> :
          <>{player.playerName}</>}
      </label>

      {allowJoinButton &&
        <Button onClick={handleClickJoin}>Join</Button>}

      {allowLeaveButton &&
        <Button onClick={handleClickLeave}>Leave</Button>}

      {allowAdmitButton &&
        <Button onClick={handleClickAdmit}>Admit</Button>}

      {(allowBlockButton && !userIsHost) &&
        <Button onClick={handleClickBlock}>Block</Button>}

      {allowUnblockButton &&
        <Button onClick={handleClickUnblock}>Unblock</Button>}

      {(allowEjectButton && !userIsHost) &&
        <Button onClick={handleClickEject}>Eject</Button>}
    </ListGroup.Item>
  )
};

export default observer(AttendeeListItem);