import React, { useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';

import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { fetchGithubUser, selectUser } from '../../../features/user/userSlice';
import * as TETRIS from '../../../constants/tetris';

import '../style.scss';

import {
  TetrisBlock,
  TetrisBlocks,
  TetrisState,
  TetrisTimer,
  TetrisBackground,
  TetrisOptions,
  TetrisPropsFunc,
} from '../types';
import { drawCell } from '../utils/block';

interface PlayerInterface {
  PLAYER: string,
  CANVAS: HTMLCanvasElement,
  CTX: CanvasRenderingContext2D,
  IMAGE: HTMLImageElement
}

const PLAYER = {
  PLAYER: '',
  CANVAS: null as unknown as HTMLCanvasElement,
  CTX: null as unknown as CanvasRenderingContext2D,
  IMAGE: null as unknown as HTMLImageElement
};

const PLAYERS: PlayerInterface[] = [];

const drawBlock = (BLOCK: TetrisBlock, BACKGROUND: TetrisBackground) => {
  // drawCell(
  //   BLOCK.shape,
  //   BLOCK.posX,
  //   BLOCK.posY - TETRIS.START_Y,
  //   1,
  //   BACKGROUND.CTX,
  //   BACKGROUND.IMAGE
  // );
  // drawCell(
  //   BLOCK.GHOST.shape,
  //   BLOCK.GHOST.posX,
  //   BLOCK.GHOST.posY - TETRIS.START_Y,
  //   0.6,
  //   BACKGROUND.CTX,
  //   BACKGROUND.IMAGE
  // );
  BACKGROUND.CTX.clearRect(0, 0, TETRIS.BOARD_WIDTH, TETRIS.BOARD_HEIGHT);

  BACKGROUND.CTX.globalAlpha = 1;
  BLOCK.shape.forEach((row, dy) => {
    row.forEach((value, dx) => {
      if (value > 0)
      BACKGROUND.CTX.drawImage(
          BACKGROUND.IMAGE,
          TETRIS.OTHER_BLOCK_ONE_SIZE * (value - 1),
          0,
          TETRIS.OTHER_BLOCK_ONE_SIZE,
          TETRIS.OTHER_BLOCK_ONE_SIZE,
          (BLOCK.posX + dx) * TETRIS.OTHER_BOARD_ONE_SIZE,
          (BLOCK.posY - TETRIS.START_Y + dy) * TETRIS.OTHER_BOARD_ONE_SIZE,
          TETRIS.OTHER_BLOCK_ONE_SIZE,
          TETRIS.OTHER_BLOCK_ONE_SIZE
        );
    });
  });
};

const initSocketEvent = (socket: Socket, canvasContainer: React.RefObject<HTMLCanvasElement>[]) => {
  socket.on('enter new player', id => { // 새로운 플레이어 입장 시 해당 플레이어의 CANVAS 초기화
    console.log(`새 친구 ${id}`);
    PLAYERS.push({
      PLAYER: id,
      CANVAS: null as unknown as HTMLCanvasElement,
      CTX: null as unknown as CanvasRenderingContext2D,
      IMAGE: null as unknown as HTMLImageElement
    });

    const idx = PLAYERS.length - 1;

    PLAYERS[idx].CANVAS = document.querySelector(`[data-player="${idx}"]`) as HTMLCanvasElement;
    PLAYERS[idx].CTX = PLAYERS[idx].CANVAS?.getContext('2d') as CanvasRenderingContext2D;
    PLAYERS[idx].CTX.clearRect(0, 0, TETRIS.BOARD_WIDTH, TETRIS.BOARD_HEIGHT);
    PLAYERS[idx].IMAGE = new Image();
    PLAYERS[idx].IMAGE.src = 'assets/other_block.png';
    PLAYERS[idx].IMAGE.onload = () => {};

    console.log('새 Player');
    console.log(PLAYERS);
  });
  socket.emit('get other players info', (res: []) => { // 초기 접속 시 다른 플레이어 정보 요청
    res.forEach(id => {
      PLAYERS.push({
        PLAYER: id,
        CANVAS: null as unknown as HTMLCanvasElement,
        CTX: null as unknown as CanvasRenderingContext2D,
        IMAGE: null as unknown as HTMLImageElement
      });
  
      const idx = PLAYERS.length - 1;
  
      PLAYERS[idx].CANVAS = document.querySelector(`[data-player="${idx}"]`) as HTMLCanvasElement;
      PLAYERS[idx].CTX = PLAYERS[idx].CANVAS?.getContext('2d') as CanvasRenderingContext2D;
      PLAYERS[idx].CTX.clearRect(0, 0, TETRIS.BOARD_WIDTH, TETRIS.BOARD_HEIGHT);
      PLAYERS[idx].IMAGE = new Image();
      PLAYERS[idx].IMAGE.src = 'assets/other_block.png';
      PLAYERS[idx].IMAGE.onload = () => {};
    });

    console.log('이미 있던 사람들');
    console.log(PLAYERS);
  });

  socket.on(`other player's drop block`, (id, block) => {
    PLAYERS.forEach(player => {
      if(player.PLAYER === id) {
        const BACKGROUND = {
          CANVAS: player.CANVAS,
          CTX: player.CTX,
          IMAGE: player.IMAGE
        }

        drawBlock(block, BACKGROUND);
      }
    });
    console.log(PLAYERS);
    console.log(id);
    console.log(block);
  });
}

const OtherBoard = ({ socket }: { socket: Socket; }): JSX.Element => {
  const canvasContainer = [useRef<HTMLCanvasElement>(null), useRef<HTMLCanvasElement>(null), useRef<HTMLCanvasElement>(null)];
  // const user = useAppSelector(selectUser);

  useEffect(() => {
    initSocketEvent(socket, canvasContainer);



  }, []);

  return (
    <>
    <canvas
      style={{
        background: `url(assets/other_player_board.png)`,
      }}
      className="other-board"
      data-player={0}
      width={TETRIS.OTHER_BOARD_WIDTH}
      height={TETRIS.OTHER_BOARD_HEIGHT}
    ></canvas>
    <canvas
      style={{
        background: `url(assets/other_player_board.png)`,
      }}
      className="other-board"
      data-player={1}
      width={TETRIS.OTHER_BOARD_WIDTH}
      height={TETRIS.OTHER_BOARD_HEIGHT}
    ></canvas>
    <canvas
      style={{
        background: `url(assets/other_player_board.png)`,
      }}
      className="other-board"
      data-player={2}
      width={TETRIS.OTHER_BOARD_WIDTH}
      height={TETRIS.OTHER_BOARD_HEIGHT}
    ></canvas>
    </>
  );
};

export default OtherBoard;
