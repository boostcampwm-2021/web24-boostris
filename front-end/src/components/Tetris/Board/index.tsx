import React, { useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import * as TETRIS from '../../../constants/tetris';
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

const BOARD: number[][] = TETRIS.BOARD;

const BLOCK: TetrisBlocks = {
  NOW: null as unknown as TetrisBlock,
  BEFORE: null as unknown as TetrisBlock,
  NEXT: null as unknown as TetrisBlock,
  GHOST: null as unknown as TetrisBlock,
  HOLD: null as unknown as TetrisBlock,
};

const STATE: TetrisState = {
  QUEUE: null as unknown as TetrisBlock[],
  CAN_HOLD: null as unknown as boolean,
  SOLID_GARBAGES: null as unknown as number,
  ATTACKED_GARBAGES: null as unknown as number,
  KEYDOWN_RIGHT: null as unknown as boolean,
  KEYDOWN_LEFT: null as unknown as boolean,
  KEYDOWN_DOWN: null as unknown as boolean,
  KEYDOWN_TURN_RIGHT: null as unknown as boolean,
  KEYDOWN_TURN_LEFT: null as unknown as boolean,
  KEYDOWN_HARD_DROP: null as unknown as boolean,
};

const TIMER: TetrisTimer = {
  PLAY_TIME: null as unknown as number,
  DROP: null as unknown as NodeJS.Timeout,
  CONFLICT: null as unknown as NodeJS.Timeout,
  SOLID_GARBAGE_TIMEOUT: null as unknown as NodeJS.Timeout,
  SOLID_GARBAGE_INTERVAL: null as unknown as NodeJS.Timeout,
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

const PROPS_FUNC: TetrisPropsFunc = {
  HOLD_FUNC: null as unknown as () => {},
  PREVIEW_FUNC: null as unknown as () => {},
  GAMEOVER_FUNC: null as unknown as () => {},
};

// 추가 블록 7개를 반환하는 함수
const getPreviewBlocks = () => {
  const randomBlocks = TETRIS.randomTetromino();
  const queue: TetrisBlock[] = [];

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
const setFreeze = (BOARD: number[][], BLOCK: TetrisBlock) => {
  BLOCK.shape.forEach((row: Array<number>, y: number) => {
    row.forEach((value: number, x: number) => {
      const [nX, nY] = [BLOCK.posX + x, BLOCK.posY + y];
      if (value > 0 && TETRIS.withInRange(nX, nY)) {
        BOARD[nY][nX] = BLOCK.color;
      }
    });
  });

  console.table(BOARD);
};

// 한 줄을 지우고 그 위 줄들을 내리는 함수
const clearLine = (board: number[][], socket: Socket) => {
  let clearLineCnt = 0;

  board.forEach((row, y) => {
    if (row.every((value) => value > 1)) {
      clearLineCnt++;
      board.splice(y, 1);
      board.unshift(Array(TETRIS.COLS).fill(0));
    }
  });

  const key = clearLineCnt.toString();

  if (TETRIS.GARBAGE_RULES[key] === 0) return;
  socket.emit('attack other player', TETRIS.GARBAGE_RULES[key]);
};

// BOARD에 SOLID GARBAGE를 만드는 함수
const setSolidBlock = (board: number[][], STATE: TetrisState, socket: Socket) => {
  const attackedBlock = [2, 2, 2, 2, 2, 2, 2, 2, 2, 2];

  attackedBlock[Math.floor(Math.random() * 10)] = 0; // 한칸은 비워두기

  for (let i = 4; i < TETRIS.ROWS; i++) {
    if (board[i][0] === 1) {
      // 다음 칸이 solid garbage이거나 아예 없는 경우
      for (let j = 0; j < STATE.ATTACKED_GARBAGES; j++) {
        board.splice(i, 0, attackedBlock.slice());
        board.shift();
      }
      break;
    } else if (i === TETRIS.ROWS - 1) {
      for (let j = 0; j < STATE.ATTACKED_GARBAGES; j++) {
        board.shift();
        board.push(attackedBlock.slice());
      }
      break;
    }
  }

  // 공격 블록이 올라온 후 AttackBar 비워주는 처리
  BACKGROUND.CTX.clearRect(TETRIS.BOARD_WIDTH, 0, 8, TETRIS.BOARD_HEIGHT);
  socket.emit('attacked finish');

  for (let i = 0; i < STATE.SOLID_GARBAGES; i++) {
    board.shift();
    board.push(Array(TETRIS.COLS).fill(1));
  }

  STATE.SOLID_GARBAGES = 0;
  STATE.ATTACKED_GARBAGES = 0;
};

// 블록이 한칸 다음으로 더 나아갈 수 있는지 아닌지 확인하는 함수 (블록이 바닥으로 내려오거나, 다른 블록 위에 떠 있는 경우 확인)
const isBottom = (board: number[][], block: TetrisBlock) => {
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

//BOARD를 그리는 함수
const drawBoard = (BOARD: number[][], BACKGROUND: TetrisBackground) => {
  BACKGROUND.CTX.clearRect(0, 0, TETRIS.BOARD_WIDTH, TETRIS.BOARD_HEIGHT);
  drawCell(BOARD, 0, -TETRIS.START_Y, 1, BACKGROUND.CTX, BACKGROUND.IMAGE);
};

//BLOCK(GHOST, BLOCK)를 그리는 함수
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

// BOARD와 BLOCK을 그리는 함수
const draw = (BOARD: number[][], BLOCK: TetrisBlocks, BACKGROUND: TetrisBackground) => {
  drawBoard(BOARD, BACKGROUND);
  drawBlock(BLOCK, BACKGROUND);
};

// 충돌이 있는지 없는지 검사하는 함수
const isNotConflict = (block: TetrisBlock, board: number[][]) => {
  return block.shape.every((row: Array<number>, y: number) => {
    return row.every((value: number, x: number) => {
      const [nX, nY] = [block.posX + x, block.posY + y];
      return value === 0 || (TETRIS.withInRange(nX, nY) && board[nY][nX] === 0);
    });
  });
};

// 블록을 45도 isRight에 따라 (시계 or 반시계)회전 시키는 함수
const rotate = (block: TetrisBlock, isRight: boolean) => {
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
const isGameOver = (board: number[][], block: TetrisBlock) => {
  const gameOverArr = board.slice(0, 4);

  const outRange = gameOverArr.every((row: Array<number>, y: number) => {
    // 블록의 범위 검사
    return row.every((value: number, x: number) => value !== 0);
  });

  //const overlapBlock = isNotConflict(block, board); :: 이걸로 대체하면, 맨 마지막 줄을 채우고 clear 되는 게 안되는 걸까?
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
const hardDropBlock = (board: number[][], block: TetrisBlock) => {
  const nextBlock = JSON.parse(JSON.stringify(block));

  while (true) {
    if (isBottom(board, nextBlock)) {
      break;
    }
    nextBlock.posY += 1;
  }

  return nextBlock;
};

const popBlockQueue = (STATE: TetrisState, PROPS_FUNC: TetrisPropsFunc) => {
  const next = STATE.QUEUE.shift() as TetrisBlock;
  if (STATE.QUEUE.length === 5) {
    STATE.QUEUE.push(...getPreviewBlocks());
  }
  PROPS_FUNC.PREVIEW_FUNC([...STATE.QUEUE]);
  return next;
};

// 각 event.key에 따라 블록을 바꿔서 반환
const moves = {
  [TETRIS.KEY.LEFT]: (prev: TetrisBlock) => ({
    ...prev,
    posX: prev.posX - 1,
  }),
  [TETRIS.KEY.RIGHT]: (prev: TetrisBlock) => ({
    ...prev,
    posX: prev.posX + 1,
  }),
  [TETRIS.KEY.DOWN]: (prev: TetrisBlock) => ({
    ...prev,
    posY: prev.posY + 1,
  }),
  [TETRIS.KEY.TURN_RIGHT]: (prev: TetrisBlock) => rotate(JSON.parse(JSON.stringify(prev)), true),
  [TETRIS.KEY.TURN_LEFT]: (prev: TetrisBlock) => rotate(JSON.parse(JSON.stringify(prev)), false),
  [TETRIS.KEY.HOLD]: (prev: TetrisBlock) => prev,
  [TETRIS.KEY.HARD_DROP]: (prev: TetrisBlock) => prev,
};

// 시작 전 테트리스를 초기화 하는 함수
const initTetris = (
  BOARD: number[][],
  BLOCK: TetrisBlocks,
  STATE: TetrisState,
  TIMER: TetrisTimer,
  BACKGROUND: TetrisBackground,
  endGame: () => void,
  getHoldBlockState: (newBlock: TetrisBlock) => void,
  getPreviewBlocksList: (newBlocks: null | Array<TetrisBlock>) => void
) => {
  PROPS_FUNC.GAMEOVER_FUNC = endGame;
  PROPS_FUNC.HOLD_FUNC = getHoldBlockState;
  PROPS_FUNC.PREVIEW_FUNC = getPreviewBlocksList;

  for (let i = 0; i < BOARD.length; i++) {
    for (let j = 0; j < BOARD[i].length; j++) BOARD[i][j] = 0;
  }

  STATE.QUEUE = getPreviewBlocks();
  STATE.CAN_HOLD = true;
  STATE.SOLID_GARBAGES = 0;
  STATE.ATTACKED_GARBAGES = 0;
  STATE.KEYDOWN_RIGHT = false;
  STATE.KEYDOWN_LEFT = false;
  STATE.KEYDOWN_DOWN = false;
  STATE.KEYDOWN_TURN_RIGHT = false;
  STATE.KEYDOWN_TURN_LEFT = false;
  STATE.KEYDOWN_HARD_DROP = false;

  BLOCK.NOW = popBlockQueue(STATE, PROPS_FUNC);
  BLOCK.GHOST = hardDropBlock(BOARD, BLOCK.NOW);
  BLOCK.HOLD = null as unknown as TetrisBlock;
  BLOCK.NEXT = null as unknown as TetrisBlock;
  BLOCK.BEFORE = null as unknown as TetrisBlock;

  TIMER.PLAY_TIME = 0;

  BACKGROUND.CANVAS = document.querySelector('.board') as HTMLCanvasElement;
  BACKGROUND.CTX = BACKGROUND.CANVAS.getContext('2d') as CanvasRenderingContext2D;
  BACKGROUND.CTX.clearRect(0, 0, TETRIS.BOARD_WIDTH, TETRIS.BOARD_HEIGHT);
  BACKGROUND.IMAGE = new Image();
  BACKGROUND.IMAGE.src = '/assets/block.png';
  BACKGROUND.IMAGE.onload = () => {};
};

// 블록이 움직이면 BLOCK의 상태를 업데이트하고 이를 그려줌.
const moveBlock = (
  BOARD: number[][],
  BLOCK: TetrisBlocks,
  BACKGROUND: TetrisBackground,
  socket: Socket
) => {
  BLOCK.BEFORE = BLOCK.NOW;
  if (isNotConflict(BLOCK.NEXT, BOARD)) {
    BLOCK.NOW = BLOCK.NEXT;
    BLOCK.GHOST = hardDropBlock(BOARD, BLOCK.NOW);
    draw(BOARD, BLOCK, BACKGROUND);
    socket.emit('drop block', BOARD, { NOW: BLOCK.NOW, GHOST: BLOCK.GHOST });
  }
};

// 블록을 Freeze, clearLine, 다음 블록을 꺼내오는 함수
const freezeBlock = (
  BOARD: number[][],
  BLOCK: TetrisBlocks,
  STATE: TetrisState,
  TIMER: TetrisTimer,
  option: string,
  PROPS_FUNC: TetrisPropsFunc,
  socket: Socket
) => {
  if (option === 'TIME_OUT' || option === 'HARD_DROP') {
    BLOCK.NOW = hardDropBlock(BOARD, BLOCK.NOW);
  }
  setFreeze(BOARD, BLOCK.NOW);
  clearLine(BOARD, socket);
  BLOCK.NEXT = popBlockQueue(STATE, PROPS_FUNC);
};

// 게임 종료 시 처리해야할 것들을 모아둔 함수
const finishGame = (
  BOARD: number[][],
  TIMER: TetrisTimer,
  BACKGROUND: TetrisBackground,
  PROPS_FUNC: TetrisPropsFunc,
  socket: Socket
) => {
  gameoverBlocks(BOARD);
  socket.emit('drop block', BOARD, 'finish');
  drawBoard(BOARD, BACKGROUND);
  PROPS_FUNC.GAMEOVER_FUNC();
};

// 블록이 Freeze되고 새로운 블록이 생성될 때 초기화 되어야 하는 것들을 모아둔 함수
const initNewBlockCycle = (
  BOARD: number[][],
  BLOCK: TetrisBlocks,
  STATE: TetrisState,
  TIMER: TetrisTimer,
  BACKGROUND: TetrisBackground,
  socket: Socket
) => {
  BLOCK.NOW = BLOCK.NEXT;

  if (STATE.QUEUE.length === 5) {
    STATE.QUEUE.push(...getPreviewBlocks());
  }

  setSolidBlock(BOARD, STATE, socket);

  BLOCK.GHOST = hardDropBlock(BOARD, BLOCK.NOW);

  // STATE.SOLID_GARBAGES = 0;
  // STATE.ATTACKED_GARBAGES = 0;
  STATE.CAN_HOLD = true;

  clearInterval(TIMER.DROP);
  TIMER.PLAY_TIME = 0;
  TIMER.DROP = setInterval(() => {
    BLOCK.NEXT = moves[TETRIS.KEY.DOWN](BLOCK.NOW);
    moveBlock(BOARD, BLOCK, BACKGROUND, socket);
  }, 900);

  socket.emit('drop block', BOARD, { NOW: BLOCK.NOW, GHOST: BLOCK.GHOST });
  draw(BOARD, BLOCK, BACKGROUND);
};

// 블록이 내려감 : freeze, clearLine, gameOver 판단
const dropBlockCycle = (
  BOARD: number[][],
  BLOCK: TetrisBlocks,
  STATE: TetrisState,
  TIMER: TetrisTimer,
  option: string,
  PROPS_FUNC: TetrisPropsFunc,
  BACKGROUND: TetrisBackground,
  socket: Socket
) => {
  freezeBlock(BOARD, BLOCK, STATE, TIMER, option, PROPS_FUNC, socket);

  // 게임 오버 검사
  if (isGameOver(BOARD, BLOCK.NEXT)) {
    finishGame(BOARD, TIMER, BACKGROUND, PROPS_FUNC, socket);
    return;
  }
  initNewBlockCycle(BOARD, BLOCK, STATE, TIMER, BACKGROUND, socket);
};

//블록을 홀드함
const holdBlock = (
  BOARD: number[][],
  BLOCK: TetrisBlocks,
  STATE: TetrisState,
  PROPS_FUNC: TetrisPropsFunc,
  BACKGROUND: TetrisBackground,
  socket: Socket
) => {
  const tmpBlock = {
    posX: TETRIS.START_X,
    posY: TETRIS.START_Y - 1,
    dir: 0,
    ...TETRIS.TETROMINO[BLOCK.NOW.index],
  };

  if (!BLOCK.HOLD) {
    BLOCK.HOLD = tmpBlock;
    BLOCK.NOW = popBlockQueue(STATE, PROPS_FUNC);
  } else {
    [BLOCK.NOW, BLOCK.HOLD] = [BLOCK.HOLD, tmpBlock];
  }
  BLOCK.GHOST = hardDropBlock(BOARD, BLOCK.NOW);
  socket.emit('drop block', BOARD, { NOW: BLOCK.NOW, GHOST: BLOCK.GHOST });
  draw(BOARD, BLOCK, BACKGROUND);
  PROPS_FUNC.HOLD_FUNC(BLOCK.HOLD);
};

const Board = ({
  socket,
  gameStart,
  gameOver,
  endGame,
  getHoldBlockState,
  getPreviewBlocksList,
}: {
  socket: Socket;
  gameStart: boolean;
  gameOver: boolean;
  endGame: () => void;
  getHoldBlockState: (newBlock: TetrisBlock) => void;
  getPreviewBlocksList: (newBlocks: null | Array<TetrisBlock>) => void;
}): JSX.Element => {
  console.log(gameStart);
  useEffect(() => {
    if (!gameStart) return;

    initTetris(
      BOARD,
      BLOCK,
      STATE,
      TIMER,
      BACKGROUND,
      endGame,
      getHoldBlockState,
      getPreviewBlocksList
    ); // 테트리스 초기화

    BACKGROUND.IMAGE.onload = () => {
      socket.emit('drop block', BOARD, { NOW: BLOCK.NOW, GHOST: BLOCK.GHOST });
      draw(BOARD, BLOCK, BACKGROUND); // 초기 화면을 그린다

      TIMER.DROP = setInterval(() => {
        BLOCK.NEXT = moves[TETRIS.KEY.DOWN](BLOCK.NOW);
        moveBlock(BOARD, BLOCK, BACKGROUND, socket);
      }, 900); // 블록을 0.9초마다 한칸씩 떨어뜨리는 타이머 등록

      TIMER.CONFLICT = setInterval(() => {
        // 블록이 떨어지면서 바닥에 도달한 경우, 0.5초 마다 움직임이 있는지 검사하는 타이머, 움직임이 없으면 freeze 있으면 다시 0.5초 동안 반복
        if (isBottom(BOARD, BLOCK.NOW)) {
          if (JSON.stringify(BLOCK.NOW) === JSON.stringify(BLOCK.BEFORE) || TIMER.PLAY_TIME >= 20) {
            dropBlockCycle(
              BOARD,
              BLOCK,
              STATE,
              TIMER,
              TIMER.PLAY_TIME >= 20 ? OPTIONS.TIME_OUT : '',
              PROPS_FUNC,
              BACKGROUND,
              socket
            );
          }
        }
        TIMER.PLAY_TIME += 0.5;
      }, 500);

      TIMER.SOLID_GARBAGE_TIMEOUT = setTimeout(
        () => (TIMER.SOLID_GARBAGE_INTERVAL = setInterval(() => STATE.SOLID_GARBAGES++, 5000)),
        120000
      ); // 솔리드 가비지 타이머
    };

    //   window.onkeydown = function(e){ //키를 눌렀을때
    //     var that = this;//키 누르기 반영할 개체 가리킴
    //     this.keytime = setTimeout(function(){
    //         //여기에 키를 누를때마다 수행할 부분 구현
    //         that.isFirstPressed = true; //처음 눌렀다는 속성 반영
    //         that.onkeydown.call(that, e);//연속 수행
    //     }, this.isFirstPressed ? 100 : 1000);
    // };
    // window.onkeyup = function(){ //키를 뗐을때
    //     clearTimeout(this.keytime); //키 누르기 중단
    //     this.isFirstPressed = false; //처음 누르기 초기화
    // }
    //let keydown = false;
    //let keydownInterval: NodeJS.Timeout;
    let leftInterval: NodeJS.Timeout;
    let leftContInterval: NodeJS.Timeout;
    let leftTimeOut: NodeJS.Timeout;
    let rightInterval: NodeJS.Timeout;
    let rightContInterval: NodeJS.Timeout;
    let rightTimeOut: NodeJS.Timeout;
    let downInterval: NodeJS.Timeout;

    const keyDownEventHandler = (event: KeyboardEvent) => {
      event.preventDefault();
      if (!moves[event.key]) return;
      BLOCK.NEXT = moves[event.key](BLOCK.NOW);

      switch (event.key) {
        // 방향 키 이벤트(왼쪽, 오른쪽, 아래)
        case TETRIS.KEY.LEFT:
          if (!STATE.KEYDOWN_LEFT) {
            if (STATE.KEYDOWN_RIGHT) {
              // 오른쪽이 계속 눌리고 있다면
              clearInterval(rightInterval);
              clearInterval(rightContInterval);
              clearInterval(rightTimeOut);
            }

            STATE.KEYDOWN_LEFT = true;
            clearInterval(leftTimeOut);
            leftTimeOut = setTimeout(
              () =>
                (leftInterval = setInterval(() => {
                  window.dispatchEvent(new KeyboardEvent('keydown', { key: event.key }));
                }, 20)),
              200
            );
          }
          moveBlock(BOARD, BLOCK, BACKGROUND, socket);
          break;
        case TETRIS.KEY.RIGHT:
          if (!STATE.KEYDOWN_RIGHT) {
            if (STATE.KEYDOWN_LEFT) {
              // 왼쪽이 계속 눌리고 있다면
              clearInterval(leftInterval);
              clearInterval(leftContInterval);
              clearInterval(leftTimeOut);
            }
            STATE.KEYDOWN_RIGHT = true;
            clearInterval(rightTimeOut);
            rightTimeOut = setTimeout(
              () =>
                (rightInterval = setInterval(() => {
                  window.dispatchEvent(new KeyboardEvent('keydown', { key: event.key }));
                }, 20)),
              200
            );
          }
          moveBlock(BOARD, BLOCK, BACKGROUND, socket);
          break;
        case TETRIS.KEY.DOWN:
          if (!STATE.KEYDOWN_DOWN) {
            STATE.KEYDOWN_DOWN = true;
            downInterval = setInterval(() => {
              window.dispatchEvent(new KeyboardEvent('keydown', { key: event.key }));
            }, 5);
          }
          moveBlock(BOARD, BLOCK, BACKGROUND, socket);
          break;
        // 회전 키 이벤트(위, z)
        case TETRIS.KEY.TURN_RIGHT:
          if (STATE.KEYDOWN_TURN_RIGHT) return;
          STATE.KEYDOWN_TURN_RIGHT = true;
          BLOCK.NEXT = SRSAlgorithm(BOARD, BLOCK, event.key);
          moveBlock(BOARD, BLOCK, BACKGROUND, socket);
          break;
        case TETRIS.KEY.TURN_LEFT:
          if (STATE.KEYDOWN_TURN_LEFT) return;
          STATE.KEYDOWN_TURN_LEFT = true;
          BLOCK.NEXT = SRSAlgorithm(BOARD, BLOCK, event.key);
          moveBlock(BOARD, BLOCK, BACKGROUND, socket);
          break;
        // 홀드 키(c)
        case TETRIS.KEY.HOLD:
          if (STATE.CAN_HOLD) {
            STATE.CAN_HOLD = false;
            holdBlock(BOARD, BLOCK, STATE, PROPS_FUNC, BACKGROUND, socket);
          }
          break;
        // 하드 드롭(스페이스 키)
        case TETRIS.KEY.HARD_DROP:
          if (STATE.KEYDOWN_HARD_DROP) return;
          STATE.KEYDOWN_HARD_DROP = true;
          dropBlockCycle(
            BOARD,
            BLOCK,
            STATE,
            TIMER,
            OPTIONS.HARD_DROP,
            PROPS_FUNC,
            BACKGROUND,
            socket
          );
          break;
        default:
          break;
      }
    };

    const keyUpEventHandler = (event: KeyboardEvent) => {
      switch (event.key) {
        case TETRIS.KEY.LEFT:
          STATE.KEYDOWN_LEFT = false;
          clearInterval(leftInterval);
          clearInterval(leftContInterval);
          clearInterval(leftTimeOut);
          if (STATE.KEYDOWN_RIGHT) {
            // 오른쪽이 계속 눌리고 있다면
            clearInterval(rightTimeOut);
            rightTimeOut = setTimeout(
              () =>
                (rightContInterval = setInterval(() => {
                  window.dispatchEvent(new KeyboardEvent('keydown', { key: TETRIS.KEY.RIGHT }));
                }, 20)),
              200
            );
          }
          break;
        case TETRIS.KEY.RIGHT:
          STATE.KEYDOWN_RIGHT = false;
          clearInterval(rightInterval);
          clearInterval(rightContInterval);
          clearInterval(rightTimeOut);
          if (STATE.KEYDOWN_LEFT) {
            // 왼쪽이 계속 눌리고 있다면
            clearInterval(leftTimeOut);
            leftTimeOut = setTimeout(
              () =>
                (leftContInterval = setInterval(() => {
                  window.dispatchEvent(new KeyboardEvent('keydown', { key: TETRIS.KEY.LEFT }));
                }, 20)),
              200
            );
          }
          break;
        case TETRIS.KEY.DOWN:
          STATE.KEYDOWN_DOWN = false;
          clearInterval(downInterval);
          break;
        case TETRIS.KEY.TURN_RIGHT:
          STATE.KEYDOWN_TURN_RIGHT = false;
          break;
        case TETRIS.KEY.TURN_LEFT:
          STATE.KEYDOWN_TURN_LEFT = false;
          break;
        case TETRIS.KEY.HARD_DROP:
          STATE.KEYDOWN_HARD_DROP = false;
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', keyDownEventHandler);
    window.addEventListener('keyup', keyUpEventHandler);

    return () => {
      TIMER.PLAY_TIME = 0;
      clearInterval(TIMER.DROP);
      clearInterval(TIMER.CONFLICT);
      clearInterval(TIMER.SOLID_GARBAGE_INTERVAL);
      clearTimeout(TIMER.SOLID_GARBAGE_TIMEOUT);

      window.removeEventListener('keydown', keyDownEventHandler);
      window.removeEventListener('keyup', keyUpEventHandler);
    };
  }, [gameStart]);

  useEffect(() => {
    socket.on('attacked', (garbage) => {
      STATE.ATTACKED_GARBAGES += garbage;

      if (STATE.ATTACKED_GARBAGES === 0) return;
      BACKGROUND.CTX.fillStyle = '#0055FB';
      BACKGROUND.CTX.clearRect(TETRIS.BOARD_WIDTH, 0, TETRIS.ATTACK_BAR, TETRIS.BOARD_HEIGHT);
      BACKGROUND.CTX.fillRect(
        TETRIS.BOARD_WIDTH,
        TETRIS.BOARD_HEIGHT - STATE.ATTACKED_GARBAGES * TETRIS.BLOCK_SIZE - 1,
        TETRIS.ATTACK_BAR,
        STATE.ATTACKED_GARBAGES * TETRIS.BLOCK_ONE_SIZE
      );
    });
  }, []);

  return (
    <>
      <canvas
        style={{
          position: 'relative',
        }}
        className="board"
        width={TETRIS.BOARD_WIDTH + TETRIS.ATTACK_BAR}
        height={TETRIS.BOARD_HEIGHT}
      ></canvas>
    </>
  );
};

export default Board;
