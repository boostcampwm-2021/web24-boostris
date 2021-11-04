import React, { useEffect, useRef, useState } from 'react';
import BubbleButton from '../BubbleButton';
import Board from './Board';
import HoldBlock from './HoldBlock';
import PreviewBlocks from './PreviewBlocks';
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
  const [previewBlock, setPreviewBlock] =
    useState<Array<blockInterface> | null>(null);

  const clickStartButton = () => {
    if (!gameStart) setgameStart(true);
  };

  const endGame = () => {
    setgameStart(false);
    setHoldBlock(null);
    setPreviewBlock(null);
  };

  const getHoldBlock = (newBlock: blockInterface) => {
    setHoldBlock({ ...newBlock });
  };

  const getPreviewBlocks = (newBlocks: Array<blockInterface>) => {
    setPreviewBlock(JSON.parse(JSON.stringify(newBlocks)));
  };

  return (
    <div style={{ width: '100%', display: 'flex', padding: '50px' }}>
      <HoldBlock holdBlock={holdBlock} />
      <div style={{ margin: '0px 40px' }}>
        <RealBoard
          gameStart={gameStart}
          endGame={endGame}
          getHoldBlockState={getHoldBlock}
          getPreviewBlocksList={getPreviewBlocks}
        />
      </div>
      <div>
        <PreviewBlocks previewBlock={previewBlock} />
        <BubbleButton
          variant={gameStart ? 'inactive' : 'active'}
          label="게임 시작"
          handleClick={clickStartButton}
        />
      </div>
    </div>
  );
};
export default Tetris;