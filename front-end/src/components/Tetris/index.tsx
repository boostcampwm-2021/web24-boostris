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
  index: number;
}

const Tetris = (): JSX.Element => {
  const [gameStart, setgameStart] = useState(false);
  const [holdBlock, setHoldBlock] = useState<blockInterface | null>(null);

  const clickStartButton = () => {
    if (!gameStart) setgameStart(true);
  };

  const endGame = () => {
    setgameStart(false);
    setHoldBlock(null);
  };

  const getHoldBlock = (newBlock: blockInterface) => {
    setHoldBlock(newBlock);
  };

  return (
    <>
      <div className="tetris">
        <HoldBlock holdBlock={holdBlock} />
        <Board />
        <RealBoard
          gameStart={gameStart}
          endGame={endGame}
          getHoldBlockState={getHoldBlock}
        />
        <BubbleButton
          variant={gameStart ? 'inactive' : 'active'}
          label="게임 시작"
          handleClick={clickStartButton}
        />
      </div>
    </>
  );
};
export default Tetris;
