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
import { drawOtherCell } from '../utils/block';

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

let PLAYERS: PlayerInterface[] = [];

// BOARD와 BLOCK을 그리는 함수
const draw = (BOARD: number[][], BLOCK: TetrisBlocks, BACKGROUND: TetrisBackground) => {
  drawBoard(BOARD, BACKGROUND);
  drawBlock(BLOCK, BACKGROUND);
};

//BOARD를 그리는 함수
const drawBoard = (BOARD: number[][], BACKGROUND: TetrisBackground) => {
  BACKGROUND.CTX.clearRect(0, 0, TETRIS.OTHER_BOARD_WIDTH, TETRIS.OTHER_BOARD_HEIGHT);
  drawOtherCell(BOARD, 0, -TETRIS.START_Y, 1, BACKGROUND.CTX, BACKGROUND.IMAGE);
};

const drawBlock = (BLOCK: TetrisBlocks, BACKGROUND: TetrisBackground) => {
  drawOtherCell(
    BLOCK.NOW.shape,
    BLOCK.NOW.posX,
    BLOCK.NOW.posY - TETRIS.START_Y,
    1,
    BACKGROUND.CTX,
    BACKGROUND.IMAGE
  );
  drawOtherCell(
    BLOCK.GHOST.shape,
    BLOCK.GHOST.posX,
    BLOCK.GHOST.posY - TETRIS.START_Y,
    0.6,
    BACKGROUND.CTX,
    BACKGROUND.IMAGE
  );
};

const initSocketEvent = (socket: Socket, canvasContainer: React.RefObject<HTMLCanvasElement>[]) => {
  socket.on('enter new player', id => { // 새로운 플레이어 입장 시 해당 플레이어의 CANVAS 초기화
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
  });

  socket.on(`other player's drop block`, (id, board, block) => {
    PLAYERS.forEach(player => {
      if(player.PLAYER === id) {
        const BACKGROUND = {
          CANVAS: player.CANVAS,
          CTX: player.CTX,
          IMAGE: player.IMAGE
        }

        if(block !== 'finish') {
          draw(board, block, BACKGROUND);
        }
        else {
          drawBoard(board, BACKGROUND);
        }
      }
    });
  });

  socket.on('disconnect player', id => {
    PLAYERS = PLAYERS.filter(PLAYER => PLAYER.PLAYER !== id);
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
