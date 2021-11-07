import React, { useEffect, useRef } from 'react';
import * as TETRIS from '../../../constants/tetris';
import {
  Block,
  TetrisBlocks,
  TetrisState,
  TetrisTimer,
  TetrisBackground,
  TetrisOptions,
} from '../types';
import { drawCell } from '../refactor/block';

const BOARD: number[][] = TETRIS.BOARD;

const BLOCK: TetrisBlocks = {
  NOW: null as unknown as Block,
  BEFORE: null as unknown as Block,
  NEXT: null as unknown as Block,
  GHOST: null as unknown as Block,
  HOLD: null as unknown as Block,
};

const STATE: TetrisState = {
  QUEUE: null as unknown as Block[],
  CAN_HOLD: null as unknown as boolean,
  SOLID_GARBAGES: null as unknown as number,
  KEYDOWN: null as unknown as boolean,
};

const TIMER: TetrisTimer = {
  PLAY_TIME: null as unknown as number,
  DROP: null as unknown as NodeJS.Timeout,
  CONFLICT: null as unknown as NodeJS.Timeout,
  SOLID_GARBAGE: null as unknown as NodeJS.Timeout,
};

const BACKGROUND: TetrisBackground = {
  CANVAS: null as unknown as HTMLCanvasElement,
  CTX: null as unknown as CanvasRenderingContext2D,
  IMAGE: null as unknown as HTMLImageElement,
};

const OPTIONS: TetrisOptions = {
  TIME_OUT: 'TIME_OUT',
  HARD_DROP: 'HARD_DROP',
};

// 추가 블록 7개를 반환하는 함수
const getPreviewBlocks = () => {
  const randomBlocks = TETRIS.randomTetromino();
  const queue: Block[] = [];

  randomBlocks.forEach((block) => {
    queue.push({
      posX: TETRIS.START_X,
      posY: TETRIS.START_Y - 1,
      dir: 0,
      ...TETRIS.TETROMINO[block],
    });
  });

  return queue;
};

// 블록의 현재 위치를 기준으로 BOARD에 고정시키는 함수
const setFreeze = (BOARD: number[][], BLOCK: Block) => {
  BLOCK.shape.forEach((row: Array<number>, y: number) => {
    row.forEach((value: number, x: number) => {
      let nX = BLOCK.posX + x;
      let nY = BLOCK.posY + y;

      if (value > 0 && TETRIS.withInRange(nX, nY)) {
        BOARD[nY][nX] = BLOCK.color;
      }
    });
  });
};

// 한 줄을 지우고 그 위 줄들을 내리는 함수
const clearLine = (board: number[][]) => {
  board.forEach((row, y) => {
    if (row.every((value) => value > 1)) {
      board.splice(y, 1);
      board.unshift(Array(TETRIS.COLS).fill(0));
    }
  });
};

// BOARD에 SOLID GARBAGE를 만드는 함수
const setSolidBlock = (board: number[][], solidBlocks: number) => {
  for (let i = 0; i < solidBlocks; i++) {
    board.shift();
    board.push(Array(TETRIS.COLS).fill(1));
  }
};

// 블록이 한칸 다음으로 더 나아갈 수 있는지 아닌지 확인하는 함수 (블록이 바닥으로 내려오거나, 다른 블록 위에 떠 있는 경우 확인)
const isBottom = (board: number[][], block: Block) => {
  return block.shape.some((row, y) =>
    row.some((value: number, x: number) => {
      if (value > 0) {
        const [nX, nY] = [block.posX + x, block.posY + y];
        if (!TETRIS.withInRange(nX, nY)) return false;
        return (nY + 1 < TETRIS.ROWS && board[nY + 1][nX] !== 0) || nY + 1 >= TETRIS.ROWS;
      }
      return false;
    })
  );
};

const drawBoard = (BOARD: number[][], BACKGROUND: TetrisBackground) => {
  BACKGROUND.CTX.clearRect(0, 0, TETRIS.BOARD_WIDTH, TETRIS.BOARD_HEIGHT);
  drawCell(BOARD, 0, -TETRIS.START_Y, 1, BACKGROUND.CTX, BACKGROUND.IMAGE);
};

const drawBlock = (BLOCK: TetrisBlocks, BACKGROUND: TetrisBackground) => {
  drawCell(
    BLOCK.NOW.shape,
    BLOCK.NOW.posX,
    BLOCK.NOW.posY - TETRIS.START_Y,
    1,
    BACKGROUND.CTX,
    BACKGROUND.IMAGE
  );
  drawCell(
    BLOCK.GHOST.shape,
    BLOCK.GHOST.posX,
    BLOCK.GHOST.posY - TETRIS.START_Y,
    0.6,
    BACKGROUND.CTX,
    BACKGROUND.IMAGE
  );
};

// BOARD와 BLOCK을 다시 그리는 함수
const draw = (BOARD: number[][], BLOCK: TetrisBlocks, BACKGROUND: TetrisBackground) => {
  drawBoard(BOARD, BACKGROUND);
  drawBlock(BLOCK, BACKGROUND);
};

// 충돌이 있는지 없는지 검사하는 함수
const isNotConflict = (block: Block, board: number[][]) => {
  return block.shape.every((row: Array<number>, y: number) => {
    return row.every((value: number, x: number) => {
      const [nX, nY] = [block.posX + x, block.posY + y];
      return value === 0 || (TETRIS.withInRange(nX, nY) && board[nY][nX] === 0);
    });
  });
};

// 블록을 45도 isRight에 따라 (시계 or 반시계)회전 시키는 함수
const rotate = (block: Block, isRight: boolean) => {
  if (block.name === 'O') return block;
  for (let y = 0; y < block.shape.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [block.shape[x][y], block.shape[y][x]] = [block.shape[y][x], block.shape[x][y]];
    }
  }

  if (isRight) block.shape.forEach((row: Array<number>) => row.reverse());
  else block.shape.reverse();
  return block;
};

// 다음 회전이 가능한지 검사하는 알고리즘 (SRS 상수 자체는 실제로 검사 표가 만들어져 있는 것을 참고함)
// 좌회전일때는 -90 우회전일때는 +90 하는 방식으로 구현
// start는 현재 블록의 dir이고 end는 현재 블록을 회전 시킨 다음에 dir임
const SRSAlgorithm = (BOARD: number[][], BLOCK: TetrisBlocks, key: string) => {
  const SRS = BLOCK.NOW.name !== 'I' ? TETRIS.SRS : TETRIS.SRS_I;
  const dir: number = key === 'ArrowUp' ? 90 : -90;
  const start: number = BLOCK.NEXT.dir;
  let end: number = start;

  if (key === 'ArrowUp') {
    end = BLOCK.NEXT.dir + dir === 360 ? 0 : BLOCK.NEXT.dir + dir;
  } else {
    end = BLOCK.NEXT.dir + dir === -90 ? 270 : BLOCK.NEXT.dir + dir;
  }

  for (let i = 0; i < SRS.length; i++) {
    // 맞는 방향 비교
    if (!(SRS[i].start === start && SRS[i].end === end)) continue;

    for (let j = 0; j < SRS[i].offset.length; j++) {
      // offset 비교
      let tmpBlock = JSON.parse(JSON.stringify(BLOCK.NEXT));
      tmpBlock.posX += SRS[i].offset[j].x;
      tmpBlock.posY += SRS[i].offset[j].y;

      if (isNotConflict(tmpBlock, BOARD)) {
        tmpBlock.dir = end;
        return tmpBlock;
      }
    }
  }
  return BLOCK.NOW;
};

// 게임 오버 상황인지 체크하는 함수
// 1. BOARD에서 범위가 y 0~3인 부분에 블록이 있다면 게임 오버
// 2. 새로운 블록이 생성 됐을때 그 자리에 이미 어떤 블록이 놓여져 있다면 게임 오버 (새로운 블록은 항상 y가 4인 곳 - 최상단에 위치하기 때문)
const isGameOver = (board: number[][], block: Block) => {
  const gameOverArr = board.slice(0, 4);

  const outRange = gameOverArr.every((row: Array<number>, y: number) => {
    // 블록의 범위 검사
    return row.every((value: number, x: number) => value !== 0);
  });

  const overlapBlock = block.shape.some((row: number[], y: number) => {
    // 블록이 겹치는지 검사
    return row.some((value: number, x: number) => {
      const [nX, nY] = [block.posX + x, block.posY + y];
      return value > 0 && board[nY][nX] !== 0; // 겹치면 true 반환
    });
  });

  return outRange || overlapBlock;
};

// 게임 오버 후 BOARD에서 모든 블록을 하얀색으로 바꾸는 함수
const gameoverBlocks = (board: number[][]) => {
  board.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) board[y][x] = 1;
    });
  });
};

// 블록이 현재 상태에서 바닥으로 떨어졌을 때 블록을 반환하는 함수
const hardDropBlock = (board: number[][], block: Block) => {
  const nextBlock = JSON.parse(JSON.stringify(block));

  while (true) {
    if (isBottom(board, nextBlock)) {
      break;
    }
    nextBlock.posY += 1;
  }

  return nextBlock;
};

// 각 event.key에 따라 블록을 바꿔서 반환
const moves = {
  [TETRIS.KEY.LEFT]: (prev: Block) => ({
    ...prev,
    posX: prev.posX - 1,
  }),
  [TETRIS.KEY.RIGHT]: (prev: Block) => ({
    ...prev,
    posX: prev.posX + 1,
  }),
  [TETRIS.KEY.DOWN]: (prev: Block) => ({
    ...prev,
    posY: prev.posY + 1,
  }),
  [TETRIS.KEY.TURN_RIGHT]: (prev: Block) => rotate(JSON.parse(JSON.stringify(prev)), true),
  [TETRIS.KEY.TURN_LEFT]: (prev: Block) => rotate(JSON.parse(JSON.stringify(prev)), false),
  [TETRIS.KEY.HOLD]: (prev: Block) => prev,
  [TETRIS.KEY.HARD_DROP]: (prev: Block) => prev,
};

// 시작 전 테트리스를 초기화 하는 함수
const initTetris = (
  BOARD: number[][],
  BLOCK: TetrisBlocks,
  STATE: TetrisState,
  TIMER: TetrisTimer,
  BACKGROUND: TetrisBackground
) => {
  for (let i = 0; i < BOARD.length; i++) {
    for (let j = 0; j < BOARD[i].length; j++) BOARD[i][j] = 0;
  }

  STATE.QUEUE = getPreviewBlocks();
  STATE.CAN_HOLD = true;
  STATE.SOLID_GARBAGES = 0;
  STATE.KEYDOWN = false;

  BLOCK.NOW = STATE.QUEUE.shift() as Block;
  BLOCK.GHOST = hardDropBlock(BOARD, BLOCK.NOW);

  TIMER.PLAY_TIME = 0;

  BACKGROUND.CANVAS = document.querySelector('.board') as HTMLCanvasElement;
  BACKGROUND.CTX = BACKGROUND.CANVAS?.getContext('2d') as CanvasRenderingContext2D;
  BACKGROUND.CTX.clearRect(0, 0, TETRIS.BOARD_WIDTH, TETRIS.BOARD_HEIGHT);
  BACKGROUND.IMAGE = new Image();
  BACKGROUND.IMAGE.src = 'assets/block.png';
};

// 충돌이 나지 않으면 블록을 1칸씩 떨어뜨리는 함수
const dropBlock = (BOARD: number[][], BLOCK: TetrisBlocks, BACKGROUND: TetrisBackground) => {
  BLOCK.NEXT = JSON.parse(JSON.stringify(BLOCK.NOW));
  BLOCK.BEFORE = BLOCK.NOW;

  if (isNotConflict({ ...BLOCK.NEXT, posY: BLOCK.NEXT.posY + 1 }, BOARD)) {
    BLOCK.NEXT.posY += 1;
    BLOCK.NOW = BLOCK.NEXT;
    draw(BOARD, BLOCK, BACKGROUND);
    BLOCK.GHOST = hardDropBlock(BOARD, BLOCK.NOW);
  }
};

// 블록을 Freeze, clearLine, 다음 블록을 꺼내오는 함수
const freezeBlock = (
  BOARD: number[][],
  BLOCK: TetrisBlocks,
  STATE: TetrisState,
  TIMER: TetrisTimer,
  option: string
) => {
  if (option === 'TIME_OUT' || option === 'HARD_DROP') {
    BLOCK.NOW = hardDropBlock(BOARD, BLOCK.NOW);
  }

  setFreeze(BOARD, BLOCK.NOW);
  clearLine(BOARD);

  BLOCK.NEXT = STATE.QUEUE.shift() as Block;
};

// 게임 종료 시 처리해야할 것들을 모아둔 함수
const finishGame = (BOARD: number[][], TIMER: TetrisTimer, BACKGROUND: TetrisBackground) => {
  clearInterval(TIMER.DROP);
  clearInterval(TIMER.CONFLICT);
  gameoverBlocks(BOARD);
  drawBoard(BOARD, BACKGROUND);
};

// 블록이 Freeze되고 새로운 블록이 생성될 때 초기화 되어야 하는 것들을 모아둔 함수
const initNewBlockCycle = (
  BOARD: number[][],
  BLOCK: TetrisBlocks,
  STATE: TetrisState,
  TIMER: TetrisTimer,
  BACKGROUND: TetrisBackground
) => {
  BLOCK.NOW = BLOCK.NEXT;

  if (STATE.QUEUE.length === 5) {
    STATE.QUEUE.push(...getPreviewBlocks());
  }

  setSolidBlock(BOARD, STATE.SOLID_GARBAGES);

  BLOCK.GHOST = hardDropBlock(BOARD, BLOCK.NOW);

  STATE.SOLID_GARBAGES = 0;
  STATE.CAN_HOLD = true;

  clearInterval(TIMER.DROP);
  TIMER.PLAY_TIME = 0;
  TIMER.DROP = setInterval(() => dropBlock(BOARD, BLOCK, BACKGROUND), 900);

  draw(BOARD, BLOCK, BACKGROUND);
};

const Board = ({
  gameStart,
  endGame,
  getHoldBlockState,
  getPreviewBlocksList,
}: {
  gameStart: boolean;
  endGame: () => void;
  getHoldBlockState: (newBlock: Block) => void;
  getPreviewBlocksList: (newBlocks: null | Array<Block>) => void;
}): JSX.Element => {
  const canvasContainer = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!gameStart) return;

    initTetris(BOARD, BLOCK, STATE, TIMER, BACKGROUND); // 테트리스 초기화
    getPreviewBlocksList(STATE.QUEUE); // 큐를 미리보기 컴포넌트에 전달(아마?)

    BACKGROUND.IMAGE.onload = () => {
      draw(BOARD, BLOCK, BACKGROUND); // 초기 화면을 그린다
      TIMER.DROP = setInterval(() => dropBlock(BOARD, BLOCK, BACKGROUND), 900); // 블록을 0.9초마다 한칸씩 떨어뜨리는 타이머 등록
      TIMER.CONFLICT = setInterval(() => {
        // 블록이 떨어지면서 바닥에 도달한 경우, 0.5초 마다 움직임이 있는지 검사하는 타이머, 움직임이 없으면 freeze 있으면 다시 0.5초 동안 반복
        if (isBottom(BOARD, BLOCK.NOW)) {
          if (JSON.stringify(BLOCK.NOW) === JSON.stringify(BLOCK.BEFORE) || TIMER.PLAY_TIME >= 20) {
            freezeBlock(BOARD, BLOCK, STATE, TIMER, TIMER.PLAY_TIME >= 20 ? OPTIONS.TIME_OUT : '');
            getPreviewBlocksList(STATE.QUEUE);

            // 게임 오버 검사
            if (isGameOver(BOARD, BLOCK.NEXT)) {
              finishGame(BOARD, TIMER, BACKGROUND);
              endGame();
              return;
            }

            initNewBlockCycle(BOARD, BLOCK, STATE, TIMER, BACKGROUND);
          }
        }
        TIMER.PLAY_TIME += 0.5;
      }, 500);

      TIMER.SOLID_GARBAGE = setTimeout(
        () => setInterval(() => STATE.SOLID_GARBAGES++, 5000),
        120000
      ); // 솔리드 가비지 타이머
    };

    const keyDownEventHandler = (event: KeyboardEvent) => {
      if (!moves[event.key]) return;

      BLOCK.NEXT = moves[event.key](BLOCK.NOW);

      switch (event.key) {
        // 방향 키 이벤트(왼쪽, 오른쪽, 아래)
        case TETRIS.KEY.LEFT:
        case TETRIS.KEY.RIGHT:
        case TETRIS.KEY.DOWN:
          if (isNotConflict(BLOCK.NEXT, BOARD)) {
            BLOCK.BEFORE = BLOCK.NOW;
            BLOCK.NOW = BLOCK.NEXT;
            BLOCK.GHOST = hardDropBlock(BOARD, BLOCK.NOW);
            draw(BOARD, BLOCK, BACKGROUND);
          }
          break;
        // 회전 키 이벤트(위, z)
        case TETRIS.KEY.TURN_RIGHT:
        case TETRIS.KEY.TURN_LEFT:
          if (STATE.KEYDOWN) return;
          STATE.KEYDOWN = true;
          BLOCK.BEFORE = BLOCK.NOW;
          BLOCK.NOW = SRSAlgorithm(BOARD, BLOCK, event.key);
          BLOCK.GHOST = hardDropBlock(BOARD, BLOCK.NOW);
          draw(BOARD, BLOCK, BACKGROUND);
          break;
        // 홀드 키(c)
        case TETRIS.KEY.HOLD:
          if (STATE.CAN_HOLD) {
            STATE.CAN_HOLD = false;

            if (!BLOCK.HOLD) {
              BLOCK.HOLD = {
                posX: TETRIS.START_X,
                posY: TETRIS.START_Y - 1,
                dir: 0,
                ...TETRIS.TETROMINO[BLOCK.NOW.index],
              };
              BLOCK.NOW = STATE.QUEUE.shift() as Block;
              BLOCK.GHOST = hardDropBlock(BOARD, BLOCK.NOW);
              if (STATE.QUEUE.length === 5) {
                STATE.QUEUE.push(...getPreviewBlocks());
              }
              draw(BOARD, BLOCK, BACKGROUND);
              getHoldBlockState(BLOCK.HOLD);
            } else {
              const tmp = BLOCK.HOLD;
              BLOCK.HOLD = {
                posX: TETRIS.START_X,
                posY: TETRIS.START_Y - 1,
                dir: 0,
                ...TETRIS.TETROMINO[BLOCK.NOW.index],
              };
              BLOCK.NOW = tmp;
              BLOCK.GHOST = hardDropBlock(BOARD, BLOCK.NOW);
              draw(BOARD, BLOCK, BACKGROUND);
              getHoldBlockState(BLOCK.HOLD);
            }
          }
          break;
        // 하드 드롭(스페이스 키)
        case TETRIS.KEY.HARD_DROP:
          if (STATE.KEYDOWN) return;
          STATE.KEYDOWN = true;

          freezeBlock(BOARD, BLOCK, STATE, TIMER, OPTIONS.HARD_DROP);
          getPreviewBlocksList(STATE.QUEUE);
          // gameover
          if (isGameOver(BOARD, BLOCK.NEXT)) {
            finishGame(BOARD, TIMER, BACKGROUND);
            endGame();
            return;
          }

          initNewBlockCycle(BOARD, BLOCK, STATE, TIMER, BACKGROUND);
          break;
        default:
          break;
      }
    };

    const keyUpEventHandler = () => {
      STATE.KEYDOWN = false;
    };

    window.addEventListener('keydown', keyDownEventHandler);
    window.addEventListener('keyup', keyUpEventHandler);
    return () => {
      window.removeEventListener('keydown', keyDownEventHandler);
      window.removeEventListener('keyup', keyUpEventHandler);
    };
  }, [gameStart]);

  return (
    <canvas
      style={{
        position: 'relative',
        background: `url(assets/board.png)`,
      }}
      className="board"
      width={TETRIS.BOARD_WIDTH}
      height={TETRIS.BOARD_HEIGHT}
      ref={canvasContainer}
    ></canvas>
  );
};

export default Board;
