import React, { useEffect, useRef, useState } from 'react';
import BubbleButton from '../BubbleButton';
import Board from './Board';
import HoldBlock from './HoldBlock';
import RealBoard from './RealBoard';
import Temp from './Temp';

interface blockInterface {
  posX: number;
  posY: number;
  dir: number;
  name: string;
  shape: Array<Array<number>>;
  color: number;
}

// interface blockInterface {
//   name: string;
//   shape: Array<Array<number>>;
//   color: number;
// }

const Tetris = (): JSX.Element => {
  const [gameStart, setgameStart] = useState(false);
  const [holdBlock, setHoldBlock] = useState({
    posX: 0,
    posY: 0,
    dir: 0,
    name: 'EMPTY',
    shape: [[0]],
    color: 0,
  });

  const clickStartButton = () => {
    if (!gameStart) setgameStart(true);
  };

  const endGame = () => {
    setgameStart(false);
  };

  const getHoldBlock = (newBlock: blockInterface) => {
    setHoldBlock(newBlock);
  };

  return (
    <>
      <div className="tetris">
        <Board />
        <RealBoard gameStart={gameStart} endGame={endGame} />
        <BubbleButton
          variant={gameStart ? 'inactive' : 'active'}
          label="게임 시작"
          handleClick={clickStartButton}
        />
        {/* <Temp getHoldBlock={getHoldBlock}></Temp>
        <HoldBlock holdBlock={holdBlock} />
         */}
      </div>
    </>
  );
};
export default Tetris;
