import React, { useEffect, useRef, useState } from 'react';
import { io, Socket } from "socket.io-client";

import AppbarLayout from '../../layout/AppbarLayout';

import BubbleButton from '../BubbleButton';

import HoldBlock from './HoldBlock';
import PreviewBlocks from './PreviewBlocks';
import Board from './Board';
import OtherBoard from './OtherBoard'

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
  const [previewBlock, setPreviewBlock] = useState<Array<blockInterface> | null>(null);
  const [socket, setSocket] = useState<Socket>();

  const clickStartButton = () => {
    if (!gameStart) {
      setgameStart(true);
      setHoldBlock(null);
      setPreviewBlock(null);
    }
  };

  const endGame = () => {
    setgameStart(false);
  };

  const getHoldBlock = (newBlock: blockInterface) => {
    setHoldBlock({ ...newBlock });
  };

  const getPreviewBlocks = (newBlocks: null | Array<blockInterface>) => {
    setPreviewBlock(JSON.parse(JSON.stringify(newBlocks)));
  };

  useEffect(() => {
    setSocket(io('http://localhost:5001', { 
      transports: ['websocket'],
      upgrade: false,
      forceNew: true,
    }));
  }, []);

  return (
    <AppbarLayout>
      { socket ? (
        <div style={{ width: '100%', display: 'flex', padding: '50px' }}>
          <HoldBlock holdBlock={holdBlock} />
          <div style={{ margin: '0px 40px' }}>
            <Board
              socket={socket}
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
              disabled={gameStart}
            />
          </div>
          <div>
            <OtherBoard socket={socket}/>
          </div>
        </div>
      ) : null}
    </AppbarLayout>
  );
};
export default Tetris;
