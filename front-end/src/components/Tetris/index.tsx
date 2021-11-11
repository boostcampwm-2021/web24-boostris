import React, { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

import * as TETRIS from '../../constants/tetris';
import AppbarLayout from '../../layout/AppbarLayout';

import BubbleButton from '../BubbleButton';

import { drawBoardBackground } from './utils/tetrisDrawUtil';
import HoldBlock from './HoldBlock';
import PreviewBlocks from './PreviewBlocks';
import Board from './Board';
import OtherBoard from './OtherBoard';

import './style.scss';

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
  const canvas = useRef<HTMLCanvasElement>(null);
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

      socketRef.current.on('game started', () => {
        // 다른 플레이어가 게임 시작 누르는 것 감지
        setgameStart(false);
        setgameStart(true);
        setGameOver(false);
        setHoldBlock(null);
        setPreviewBlock(null);
      });

      socketRef.current.on('every player game over', () => {
        // 모든 플레이어가 게임 종료 된 경우
        setGameOver(true);
      });
    });
  }, []);

  useEffect(() => {
    if (!canvas.current) return;
    drawBoardBackground(canvas.current, TETRIS.BOARD_WIDTH, TETRIS.BOARD_HEIGHT, TETRIS.BLOCK_SIZE);
  }, [socketState]);

  return <AppbarLayout>aa</AppbarLayout>;
};
export default Tetris;
