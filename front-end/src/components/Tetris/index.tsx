import React, { useEffect, useRef, useState } from 'react';
import { io, Socket } from "socket.io-client";

import AppbarLayout from '../../layout/AppbarLayout';

import BubbleButton from '../BubbleButton';

import HoldBlock from './HoldBlock';
import PreviewBlocks from './PreviewBlocks';
import Board from './Board';
import OtherBoard from './OtherBoard';

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
  const [gameOver, setGameOver] = useState(true);
  const [holdBlock, setHoldBlock] = useState<blockInterface | null>(null);
  const [previewBlock, setPreviewBlock] = useState<Array<blockInterface> | null>(null);
  const socketRef = useRef<any>(null);
  const [socketState, setSocketState] = useState(false);

  const clickStartButton = (socket: Socket) => {
    socket.emit('game start');
  };

  const endGame = (socket: Socket) => {
    setgameStart(false);
    socket.emit('game over');
  };

  const getHoldBlock = (newBlock: blockInterface) => {
    setHoldBlock({ ...newBlock });
  };

  const getPreviewBlocks = (newBlocks: null | Array<blockInterface>) => {
    setPreviewBlock(JSON.parse(JSON.stringify(newBlocks)));
  };

  useEffect(() => {
    socketRef.current = io('/tetris', {
      transports: ['websocket'],
      path: '/socket.io',
    });

    socketRef.current.on('connect', () => {
      setSocketState(true);
      
      socketRef.current.on('game started', () => { // 다른 플레이어가 게임 시작 누르는 것 감지
        setgameStart(false);
        setgameStart(true);
        setGameOver(false);
        setHoldBlock(null);
        setPreviewBlock(null);
      });

      socketRef.current.on('every player game over', () => { // 모든 플레이어가 게임 종료 된 경우
        setGameOver(true);
      });
    });
  }, []);

  return (
    <AppbarLayout>
      { socketState ? (
        <div style={{ width: '100%', display: 'flex', padding: '50px' }}>
          <HoldBlock holdBlock={holdBlock} />
          <div style={{ margin: '0px 40px' }}>
            <Board
              socket={socketRef.current}
              gameStart={gameStart}
              gameOver={gameOver}
              endGame={() => endGame(socketRef.current)}
              getHoldBlockState={getHoldBlock}
              getPreviewBlocksList={getPreviewBlocks}
            />
          </div>
          <div>
            <PreviewBlocks previewBlock={previewBlock} />
            <BubbleButton
              variant={!gameOver ? 'inactive' : 'active'}
              label="게임 시작"
              handleClick={() => {clickStartButton(socketRef.current)}}
              disabled={!gameOver}
            />
          </div>
          <div>
            <OtherBoard socket={socketRef.current}/>
          </div>
        </div>
      ) : null}
    </AppbarLayout>
  );
};
export default Tetris;
