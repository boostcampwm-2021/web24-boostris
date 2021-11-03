import React, { useEffect, useRef, useState } from 'react';
import BubbleButton from '../BubbleButton';
import Board from './Board';
import RealBoard from './RealBoard';

const Tetris = (): JSX.Element => {
  const [gameStart, setgameStart] = useState(false);

  const startGame = () => {
    if (!gameStart) setgameStart(true);
  };

  const endGame = () => {
    setgameStart(false);
  };

  return (
    <>
      <div className="tetris">
        <Board />
        <RealBoard gameStart={gameStart} endGame={endGame} />
        <BubbleButton
          variant={gameStart ? 'inactive' : 'active'}
          label="게임 시작"
          handleClick={startGame}
        />
      </div>
    </>
  );
};
export default Tetris;
