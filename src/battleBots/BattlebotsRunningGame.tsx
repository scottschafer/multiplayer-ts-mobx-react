import { observer } from 'mobx-react';
import React, { useEffect, useRef, useState } from 'react';
import { AudioType, audioUtil } from './AudioUtil';
import { BattlebotsGameController } from './BattlebotsGameController';
import { BattlebotsGameModel } from './BattlebotsGameModel';
import './BattlebotsGameView.scss';
import { useFrame, Canvas } from 'react-three-fiber';
import ReactDOM from 'react-dom';
import TestScene from '../TestScene';


const BattlebotsRunningGame = observer((props: {
  currentGame: BattlebotsGameModel,
  user: firebase.User,
  controller: BattlebotsGameController
}) => {

  const { currentGame, user, controller } = props;

  const [style, setStyle] = useState({ transform: 'scale(0)' });

  const adjustScaling = () => {
    const contentWidth = 620;
    const contentHeight = 540;

    const scaleX = window.innerWidth / contentWidth;
    const scaleY = window.innerHeight / contentHeight;
    const scale = Math.min(scaleX, scaleY);
    const transform = `scale(${scale})`;
    if (style.transform !== transform) {
      setStyle({ transform });
    }
  };

  useEffect(() => {
    const startMusic = () => {
      audioUtil.playMusic(AudioType.MUSIC_GAME);
      window.removeEventListener('mousedown', startMusic, true);
    };
    window.addEventListener('mousedown', startMusic, true);
    adjustScaling();

    window.addEventListener('resize', adjustScaling);

    return () => {
      window.removeEventListener('resize', adjustScaling);
    };
  });

  return <TestScene></TestScene>;

  // <Canvas>
  //   {/* <ambientLight />
  //   <pointLight position={[10, 10, 10]} />
  //   <Box position={[-1.2, 0, 0]} />
  //   <Box position={[1.2, 0, 0]} /> */}
  // </Canvas>
  // );
});

// ReactDOM.render(
//   <Canvas>
//     <ambientLight />
//     <pointLight position={[10, 10, 10]} />
//     <Box position={[-1.2, 0, 0]} />
//     <Box position={[1.2, 0, 0]} />
//   </Canvas>,
//   document.getElementById('root3d')
// )
export default BattlebotsRunningGame;