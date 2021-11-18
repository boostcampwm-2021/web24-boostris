
import { useEffect } from 'react';
import { Socket } from 'socket.io-client';
import useAuth from '../../../hooks/use-auth';
import { useAppSelector } from '../../../app/hooks';
import * as TETRIS from '../../../constants/tetris';
import { selectSocket } from '../../../features/socket/socketSlice';
import { useSocketReady } from '../../../context/SocketContext';

import '../style.scss';

import {
  TetrisBlocks,
  TetrisBackground,
} from '../types';

import { drawOtherCell } from '../utils/block';
import { drawBoardBackground } from '../utils/tetrisDrawUtil';
import { Profile } from '../../../features/user/userSlice';

interface PlayerInterface {
  PLAYER: string;
  NICKNAME: HTMLDivElement;
  GARBAGES: number;
  CANVAS: HTMLCanvasElement;
  CTX: CanvasRenderingContext2D;
  IMAGE: HTMLImageElement;
}

const PLAYER = {
  PLAYER: '',
  CANVAS: null as unknown as HTMLCanvasElement,
  CTX: null as unknown as CanvasRenderingContext2D,
  IMAGE: null as unknown as HTMLImageElement,
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

const initSocketEvent = (socket: Socket, roomID: string | null, profile: Profile) => {
  socket.on('enter new player', (id, nickname) => {
    // 새로운 플레이어 입장 시 해당 플레이어의 CANVAS 초기화
    PLAYERS.push({
      PLAYER: id,
      NICKNAME: null as unknown as HTMLDivElement,
      GARBAGES: 0,
      CANVAS: null as unknown as HTMLCanvasElement,
      CTX: null as unknown as CanvasRenderingContext2D,
      IMAGE: null as unknown as HTMLImageElement,
    });

    const idx = PLAYERS.length - 1;

    PLAYERS[idx].NICKNAME = document.querySelector(`[data-other-player="${idx}"]`) as HTMLDivElement;
    PLAYERS[idx].NICKNAME.innerText = nickname;
    PLAYERS[idx].CANVAS = document.querySelector(`[data-player="${idx}"]`) as HTMLCanvasElement;
    PLAYERS[idx].CTX = PLAYERS[idx].CANVAS?.getContext('2d') as CanvasRenderingContext2D;
    PLAYERS[idx].CTX.clearRect(0, 0, TETRIS.BOARD_WIDTH, TETRIS.BOARD_HEIGHT);
    PLAYERS[idx].IMAGE = new Image();
    PLAYERS[idx].IMAGE.src = '/assets/other_block.png';
    PLAYERS[idx].IMAGE.onload = () => {};
  });
  socket.emit('get other players info', roomID, (res: []) => {
    // 초기 접속 시 다른 플레이어 정보 요청
    res.forEach((p: {id:string; nickname: string}) => {
      PLAYERS.push({
        PLAYER: p.id,
        NICKNAME: null as unknown as HTMLDivElement,
        GARBAGES: 0,
        CANVAS: null as unknown as HTMLCanvasElement,
        CTX: null as unknown as CanvasRenderingContext2D,
        IMAGE: null as unknown as HTMLImageElement,
      });

      const idx = PLAYERS.length - 1;

      PLAYERS[idx].NICKNAME = document.querySelector(`[data-other-player="${idx}"]`) as HTMLDivElement;
      PLAYERS[idx].NICKNAME.innerText = p.nickname;
      PLAYERS[idx].CANVAS = document.querySelector(`[data-player="${idx}"]`) as HTMLCanvasElement;
      PLAYERS[idx].CTX = PLAYERS[idx].CANVAS?.getContext('2d') as CanvasRenderingContext2D;
      PLAYERS[idx].CTX?.clearRect(0, 0, TETRIS.BOARD_WIDTH, TETRIS.BOARD_HEIGHT);
      PLAYERS[idx].IMAGE = new Image();
      PLAYERS[idx].IMAGE.src = '/assets/other_block.png';
      PLAYERS[idx].IMAGE.onload = () => {};
    });
  });

  socket.on(`other player's drop block`, (id, board, block) => {
    PLAYERS.forEach((player) => {
      if (player.PLAYER === id) {
        const BACKGROUND = {
          CANVAS: player.CANVAS,
          CTX: player.CTX,
          IMAGE: player.IMAGE,
        };

        if (block !== 'finish') {
          draw(board, block, BACKGROUND);
        } else {
          drawBoard(board, BACKGROUND);
        }
      }
    });
  });

  socket.on('someone attacked', (garbage, id) => {
    PLAYERS.forEach((player) => {
      if (player.PLAYER === id) {
        player.GARBAGES += garbage;

        if (player.GARBAGES === 0) return;
        player.CTX.fillStyle = '#0055FB';
        player.CTX.clearRect(
          TETRIS.OTHER_BOARD_WIDTH,
          0,
          TETRIS.OTHER_ATTACK_BAR,
          TETRIS.OTHER_BOARD_HEIGHT
        );
        player.CTX.fillRect(
          TETRIS.OTHER_BOARD_WIDTH,
          TETRIS.OTHER_BOARD_HEIGHT - player.GARBAGES * TETRIS.OTHER_BLOCK_SIZE - 1,
          TETRIS.OTHER_ATTACK_BAR,
          player.GARBAGES * TETRIS.OTHER_BLOCK_ONE_SIZE
        );
      }
    });
  });

  socket.on('someone attacked finish', (id) => {
    PLAYERS.forEach((player) => {
      if (player.PLAYER === id) {
        player.CTX.clearRect(
          TETRIS.OTHER_BOARD_WIDTH,
          0,
          TETRIS.OTHER_ATTACK_BAR,
          TETRIS.OTHER_BOARD_HEIGHT
        );
        player.GARBAGES = 0;
      }
    });
  });

  socket.on('leave player', (id) => {
    // 뒤로 가기, 로비로 갈때 예외 처리 필요
    const target = PLAYERS.find((p) => p.PLAYER === id) as PlayerInterface;

    if(target) {
      target?.CTX.clearRect(0, 0, TETRIS.OTHER_BOARD_WIDTH + TETRIS.OTHER_ATTACK_BAR, TETRIS.OTHER_BOARD_HEIGHT);
      target.NICKNAME.innerText = '';
      PLAYERS = PLAYERS.filter((PLAYER) => PLAYER.PLAYER !== id);
    }
  });
};

const drawOtherBoardBackground = () => {
  for (let i = 0; i < 3; i++) {
    const canvas = document.querySelector(
      `[data-player="other-board-background${i}"]`
    ) as HTMLCanvasElement;
    drawBoardBackground(
      canvas,
      TETRIS.OTHER_BOARD_WIDTH,
      TETRIS.OTHER_BOARD_HEIGHT,
      TETRIS.OTHER_BLOCK_SIZE
    );
  }
};

const OtherBoard = ({ socket }: { socket: Socket }): JSX.Element => {
  const { roomID } = useAppSelector(selectSocket);
  const { profile } = useAuth();
  const { isValidRoom } = useSocketReady();

  useEffect(() => {
    if (isValidRoom && roomID) {
      PLAYERS = [];
      drawOtherBoardBackground();
      initSocketEvent(socket, roomID, profile);
    }
  }, [isValidRoom, roomID]);

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
        <div className={'otherNickName'} data-other-player={0}></div>
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
        <div className={'otherNickName'} data-other-player={1}></div>
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
        <div className={'otherNickName'} data-other-player={2}></div>
      </div>
    </>
  );
};

export default OtherBoard;
