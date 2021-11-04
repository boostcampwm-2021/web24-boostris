import React from 'react';
import { randomTetromino, TETROMINO } from '../../constants/tetris';
import BubbleButton from '../BubbleButton';

interface blockInterface {
  posX: number;
  posY: number;
  dir: number;
  name: string;
  shape: Array<Array<number>>;
  color: number;
}

export default function Temp({
  getHoldBlock,
}: {
  getHoldBlock: (block: blockInterface) => void;
}) {
  let n = randomTetromino()[0];
  const tmpBlock = TETROMINO[n];

  const holdEvent = () => {
    getHoldBlock({ posX: 0, posY: 0, dir: 0, ...tmpBlock });
  };

  return (
    <>
      <button onClick={holdEvent}>홀드</button>
      <button>큐</button>
    </>
  );
}
