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
import { drawBoardBackground } from '../utils/tetrisDrawUtil';

interface PlayerInterface {
  PLAYER: string,
  GARBAGES: number,
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
      GARBAGES: 0,
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
        GARBAGES: 0,
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

  socket.on('someone attacked', (garbage, id) => {
    PLAYERS.forEach(player => {
      if(player.PLAYER === id) {
        player.GARBAGES += garbage;

        if(player.GARBAGES === 0) return;
        player.CTX.fillStyle = '#0055FB';
        player.CTX.clearRect(TETRIS.OTHER_BOARD_WIDTH, 0, TETRIS.OTHER_ATTACK_BAR, TETRIS.OTHER_BOARD_HEIGHT);
        player.CTX.fillRect(TETRIS.OTHER_BOARD_WIDTH, TETRIS.OTHER_BOARD_HEIGHT - (player.GARBAGES * TETRIS.OTHER_BLOCK_SIZE) - 1, TETRIS.OTHER_ATTACK_BAR, player.GARBAGES * TETRIS.OTHER_BLOCK_ONE_SIZE);
      }
    });
  });

  socket.on('someone attacked finish', id => {
    PLAYERS.forEach(player => {
      if(player.PLAYER === id) {
        player.CTX.clearRect(TETRIS.OTHER_BOARD_WIDTH, 0, TETRIS.OTHER_ATTACK_BAR, TETRIS.OTHER_BOARD_HEIGHT);
        player.GARBAGES = 0;
      }
    });
  })

  socket.on('disconnect player', id => {
    PLAYERS = PLAYERS.filter(PLAYER => PLAYER.PLAYER !== id);
  });
}

const drawOtherBoardBackground = () => {
  for(let i = 0; i < 3; i++) {
    const canvas = document.querySelector(`[data-player="other-board-background${i}"]`) as HTMLCanvasElement;
    drawBoardBackground(canvas, TETRIS.OTHER_BOARD_WIDTH, TETRIS.OTHER_BOARD_HEIGHT, TETRIS.OTHER_BLOCK_SIZE);
  }
}

const OtherBoard = ({ socket }: { socket: Socket; }): JSX.Element => {
  const canvasContainer = [useRef<HTMLCanvasElement>(null), useRef<HTMLCanvasElement>(null), useRef<HTMLCanvasElement>(null)];
  // const user = useAppSelector(selectUser);

  useEffect(() => {
    drawOtherBoardBackground();
    initSocketEvent(socket, canvasContainer);
  }, []);

  return (
    <>
    <div className="slot">
      <canvas
        className="other-board"
        data-player={0}
        width={TETRIS.OTHER_BOARD_WIDTH + TETRIS.OTHER_ATTACK_BAR}
        height={TETRIS.OTHER_BOARD_HEIGHT}
      ></canvas>
      <canvas
        className="other-board-background"
        data-player={`other-board-background0`}
        width={TETRIS.OTHER_BOARD_WIDTH + TETRIS.OTHER_ATTACK_BAR}
        height={TETRIS.OTHER_BOARD_HEIGHT}
      ></canvas>
    </div>
    <div className="slot">
    <canvas
      className="other-board"
      data-player={1}
      width={TETRIS.OTHER_BOARD_WIDTH + TETRIS.OTHER_ATTACK_BAR}
      height={TETRIS.OTHER_BOARD_HEIGHT}
    ></canvas>
    <canvas
        className="other-board-background"
        data-player={`other-board-background1`}
        width={TETRIS.OTHER_BOARD_WIDTH + TETRIS.OTHER_ATTACK_BAR}
        height={TETRIS.OTHER_BOARD_HEIGHT}
      ></canvas>
    </div>
    <div className="slot">
    <canvas
      className="other-board"
      data-player={2}
      width={TETRIS.OTHER_BOARD_WIDTH + TETRIS.OTHER_ATTACK_BAR}
      height={TETRIS.OTHER_BOARD_HEIGHT}
    ></canvas>
    <canvas
        className="other-board-background"
        data-player={`other-board-background2`}
        width={TETRIS.OTHER_BOARD_WIDTH + TETRIS.OTHER_ATTACK_BAR}
        height={TETRIS.OTHER_BOARD_HEIGHT}
      ></canvas>
    </div>
    </>
  );
};

export default OtherBoard;
