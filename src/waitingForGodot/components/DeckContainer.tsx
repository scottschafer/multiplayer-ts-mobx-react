
import { observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import { UtilGraphics } from '../../utils/UtilsGraphics';
import { GodotConstants } from '../GodotConstants';
import Button from 'react-bootstrap/esm/Button';
import './DeckContainer.scss';
import { GodotGameModel } from '../GodotGameModel';
import DeckOfCards from './DeckOfCards';

export interface DeckContainerProps {
  currentGame: GodotGameModel;
  flippedCardDeck: string;
  flippedCard: string;
  flippedCardAction: string | number;
  onClickCard: (e: React.MouseEvent) => void
}

const DeckContainer = (props: DeckContainerProps) => {
  const { currentGame, flippedCardDeck, flippedCard, flippedCardAction, onClickCard } = props;
  let flippedCardActionLabel = (typeof flippedCardAction !== 'number') ? flippedCardAction :
    (`Advance ${flippedCardAction} space${(flippedCardAction > 1) ? 's' : ''}`);

  return (
    <div className='DeckContainer'>
      <DeckOfCards cards={currentGame.decks.E} deckName='Estragon'
      // onClickCard={controller.handleClickCard}
      // flippedCard='This is a test'
      // flippedCard={(currentPlayerState.phase === TurnPhase.pullCard && currentPlayerState.deck === 'E') ? currentPlayerState.card : null}
      ></DeckOfCards>
      <DeckOfCards cards={currentGame.decks.V} deckName='Vladmir'
      // onClickCard={controller.handleClickCard}
      // flippedCard={(currentPlayerState.phase === TurnPhase.pullCard && currentPlayerState.deck === 'V') ? currentPlayerState.card : null}
      ></DeckOfCards>
      <DeckOfCards cards={currentGame.decks.P} deckName='Pozzo'
      // onClickCard={controller.handleClickCard}
      // flippedCard={(currentPlayerState.phase === TurnPhase.pullCard && currentPlayerState.deck === 'P') ? currentPlayerState.card : null}
      ></DeckOfCards>
      <DeckOfCards cards={currentGame.decks.L} deckName='Lucky'
      // onClickCard={controller.handleClickCard}
      // flippedCard={(currentPlayerState.phase === TurnPhase.pullCard && currentPlayerState.deck === 'L') ? currentPlayerState.card : null}
      ></DeckOfCards>


      {flippedCard &&
        <div className={`flip-card-container flip-card-deck-${flippedCardDeck}`}>
          <div className='flip-card' onClick={onClickCard}>
            <div className='flip-card-inner'>
              <div className='flip-card-back'>
                {/* <h2>front</h2> */}
                {/* <img src='img_avatar.png' alt='Avatar' style='width:300px;height:300px;'> */}
              </div>
              <div className='flip-card-front'>
                <p><b>{flippedCardDeck}</b></p>
                <p><i>&#8220;{flippedCard}&#8221;</i></p>

                <footer>{flippedCardActionLabel}</footer>
              </div>
            </div>
          </div>
        </div>}


    </div>
  );
}



export default observer(DeckContainer);
