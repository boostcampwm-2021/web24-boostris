
import { useEffect } from 'react';
import { Socket } from 'socket.io-client';
import useAuth from '../../../hooks/use-auth';
import { useAppSelector } from '../../../app/hooks';
import * as TETRIS from '../../../constants/tetris';
import { selectSocket } from '../../../features/socket/socketSlice';
import { useSocketReady } from '../../../context/SocketContext';

import {
  TetrisBlocks,
  TetrisBackground,
} from '../types';

import { drawOtherCell } from '../utils/block';
import { drawBoardBackground } from '../utils/tetrisDrawUtil';
import { Profile } from '../../../features/user/userSlice';

interface PlayerInterface {
  PLAYER: string;
  NICKNAME: string;
  NICKNAME_ElEMENT: HTMLDivElement;
  GARBAGES: number;
  CANVAS: HTMLCanvasElement;
  CTX: CanvasRenderingContext2D;
  IMAGE: HTMLImageElement;
  INDEX: number;
}

const PLAYER = {
  PLAYER: '',
  CANVAS: null as unknown as HTMLCanvasElement,
  CTX: null as unknown as CanvasRenderingContext2D,
  IMAGE: null as unknown as HTMLImageElement,
};

let PLAYERS: PlayerInterface[] = [];
let visited = [false, false, false];

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

const initSocketEvent = (socket: Socket, roomID: string | null, socketHandler: any) => {
  socket.on('enter new player', socketHandler.enterPlayer = (id: string, nickname: string) => {
    // 새로운 플레이어 입장 시 해당 플레이어의 CANVAS 초기화
    const player = PLAYERS.find((p) => p.PLAYER === id);

    if(!player) {
      let idx = visited.findIndex((v) => v === false);
      visited[idx] = true;

      PLAYERS.push({
        PLAYER: id,
        NICKNAME: nickname,
        NICKNAME_ElEMENT: null as unknown as HTMLDivElement,
        GARBAGES: 0,
        CANVAS: null as unknown as HTMLCanvasElement,
        CTX: null as unknown as CanvasRenderingContext2D,
        IMAGE: null as unknown as HTMLImageElement,
        INDEX: idx
      });
  
      const target = PLAYERS.find((p) => p.INDEX === idx);
  
      if(target) {
        target.NICKNAME_ElEMENT = document.querySelector(`[data-other-player="${idx}"]`) as HTMLDivElement;
        target.NICKNAME_ElEMENT.innerText = nickname;
        target.CANVAS = document.querySelector(`[data-player="${idx}"]`) as HTMLCanvasElement;
        target.CTX = target.CANVAS?.getContext('2d') as CanvasRenderingContext2D;
        target.CTX.clearRect(0, 0, TETRIS.BOARD_WIDTH, TETRIS.BOARD_HEIGHT);
        target.IMAGE = new Image();
        target.IMAGE.src = '/assets/other_block.png';
        target.IMAGE.onload = () => {};
      }
    }
  });
  socket.emit('get other players info', (res: []) => {
    // 초기 접속 시 다른 플레이어 정보 요청
    res.forEach((p: {id:string; nickname: string}) => {
      const player = PLAYERS.find((r) => r.PLAYER === p.id);

      if(!player) {
        let idx = visited.findIndex((v) => v === false);
        visited[idx] = true;

        PLAYERS.push({
          PLAYER: p.id,
          NICKNAME: p.nickname,
          NICKNAME_ElEMENT: null as unknown as HTMLDivElement,
          GARBAGES: 0,
          CANVAS: null as unknown as HTMLCanvasElement,
          CTX: null as unknown as CanvasRenderingContext2D,
          IMAGE: null as unknown as HTMLImageElement,
          INDEX: idx
        });

        const target = PLAYERS.find((p) => p.INDEX === idx);

        if(target) {
          target.NICKNAME_ElEMENT = document.querySelector(`[data-other-player="${idx}"]`) as HTMLDivElement;
          if(target.NICKNAME_ElEMENT) {
            target.NICKNAME_ElEMENT.innerText = p.nickname;
          }
          target.CANVAS = document.querySelector(`[data-player="${idx}"]`) as HTMLCanvasElement;
          target.CTX = target.CANVAS?.getContext('2d') as CanvasRenderingContext2D;
          target.CTX?.clearRect(0, 0, TETRIS.BOARD_WIDTH, TETRIS.BOARD_HEIGHT);
          target.IMAGE = new Image();
          target.IMAGE.src = '/assets/other_block.png';
          target.IMAGE.onload = () => {};
        }
      }
    });
  });

  socket.on(`other player's drop block`, socketHandler.dropBlock = (id: string, board: number[][], block: any) => {
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

  socket.on('someone attacked', socketHandler.attacked = (garbage: number, id: string) => {
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

  socket.on('someone attacked finish', socketHandler.attackedFinish = (id: string) => {
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

  socket.on('leave player', socketHandler.leavePlayer = (id: string) => {
    // 뒤로 가기, 로비로 갈때 예외 처리 필요
    const target = PLAYERS.find((p) => p.PLAYER === id) as PlayerInterface;

    if(target) {
      target.CTX.clearRect(0, 0, TETRIS.OTHER_BOARD_WIDTH + TETRIS.OTHER_ATTACK_BAR, TETRIS.OTHER_BOARD_HEIGHT);
      target.NICKNAME_ElEMENT.innerText = '';
      visited[target.INDEX] = false;
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
  const { isValidRoom } = useSocketReady();
  const socketHandler = {
    enterPlayer: null as unknown as () => void,
    dropBlock: null as unknown as () => void,
    attacked: null as unknown as () => void,
    attackedFinish: null as unknown as () => void,
    leavePlayer: null as unknown as () => void,
  };

  useEffect(() => {
    if (isValidRoom && roomID) {
      visited = [false, false, false];
      PLAYERS = [];
      drawOtherBoardBackground();
      initSocketEvent(socket, roomID, socketHandler);
    }

    return () => {
      socket.off('enter new player', socketHandler.enterPlayer);
      socket.off(`other player's drop block`, socketHandler.dropBlock);
      socket.off('someone attacked', socketHandler.attacked);
      socket.off('someone attacked finish', socketHandler.attackedFinish);
      socket.off('leave player', socketHandler.leavePlayer);
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
