
import { observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import { UtilGraphics } from '../../utils/UtilsGraphics';
import { GodotConstants } from '../GodotConstants';
import Button from 'react-bootstrap/esm/Button';
import './DeckOfCards.scss';

export interface DeckOfCardsProps {
  deckName: string;
  cards: Array<string>;
  flippedCard?: string;
  onClickCard?: (e: React.MouseEvent) => void
}

const DeckOfCards = (props: DeckOfCardsProps) => {
  const { deckName, flippedCard, cards, onClickCard } = props;

  return (
    <div className='DeckOfCards'>
      <div>
        {cards.map((text, index) => <div
          key={index}
          className='card'
          style={{ left: index * 2, top: -index * 2 }}
        >
          <label>{props.deckName[0]}</label>
          {/* {text} */}
        </div>)}
      </div>
    </div>
  );
}



export default observer(DeckOfCards);
