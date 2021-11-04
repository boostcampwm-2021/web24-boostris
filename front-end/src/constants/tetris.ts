// 보드 크기 설정
export const COLS: number = 10;
export const ROWS: number = 24;
export const BLOCK_SIZE: number = 24;

// 실제 보드 한칸의 크기
export const BOARD_ONE_SIZE: number = 24;

// 실제 블록 한개의 크기
export const BLOCK_ONE_SIZE: number = 25;

//실제 보드의 크기
export const BOARD_REAL_WIDTH: number = 240;
export const BOARD_REAL_HEIGHT: number = 480;

// 보드 이미지의 크기
export const BOARD_WIDTH: number = 241;
export const BOARD_HEIGHT: number = 481;

// 블록 시작 좌표
export const START_X: number = 3;
export const START_Y: number = 4;

// 보드 GAME OVER 범위
export const GAME_OVER_MIN_X: number = 0;
export const GAME_OVER_MAX_X: number = 10;
export const GAME_OVER_MIN_Y: number = 0;
export const GAME_OVER_MAX_Y: number = 3;

// KEY 이벤트
export const KEY = {
  LEFT: 'ArrowLeft',
  RIGHT: 'ArrowRight',
  DOWN: 'ArrowDown',
  TURN_RIGHT: 'ArrowUp',
  TURN_LEFT: 'z',
  HOLD: 'c',
  HARD_DROP: ' ',
};

// 테트로미노
export const TETROMINO = [
  {
    name: 'Z',
    shape: [
      [3, 3, 0],
      [0, 3, 3],
      [0, 0, 0],
    ],
    color: 3,
    index: 0,
  },
  {
    name: 'L',
    shape: [
      [0, 0, 4],
      [4, 4, 4],
      [0, 0, 0],
    ],
    color: 4,
    index: 1,
  },
  {
    name: 'O',
    shape: [
      [0, 5, 5, 0],
      [0, 5, 5, 0],
      [0, 0, 0, 0],
    ],
    color: 5,
    index: 2,
  },
  {
    name: 'S',
    shape: [
      [0, 6, 6],
      [6, 6, 0],
      [0, 0, 0],
    ],
    color: 6,
    index: 3,
  },
  {
    name: 'I',
    shape: [
      [0, 0, 0, 0],
      [7, 7, 7, 7],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: 7,
    index: 4,
  },
  {
    name: 'J',
    shape: [
      [8, 0, 0],
      [8, 8, 8],
      [0, 0, 0],
    ],
    color: 8,
    index: 5,
  },
  {
    name: 'T',
    shape: [
      [0, 9, 0],
      [9, 9, 9],
      [0, 0, 0],
    ],
    color: 9,
    index: 6,
  },
];

// SRS J, L, S, T, Z, O 블록 알고리즘
export const SRS = [
  {
    start: 0,
    end: 90,
    offset: [
      { x: 0, y: 0 },
      { x: -1, y: 0 },
      { x: -1, y: -1 },
      { x: 0, y: 2 },
      { x: -1, y: 2 },
    ],
  },
  {
    start: 90,
    end: 0,
    offset: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: -2 },
      { x: 1, y: -2 },
    ],
  },
  {
    start: 90,
    end: 180,
    offset: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: -2 },
      { x: 1, y: -2 },
    ],
  },
  {
    start: 180,
    end: 90,
    offset: [
      { x: 0, y: 0 },
      { x: -1, y: 0 },
      { x: -1, y: -1 },
      { x: 0, y: 2 },
      { x: -1, y: 2 },
    ],
  },
  {
    start: 180,
    end: 270,
    offset: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: -1 },
      { x: 0, y: 2 },
      { x: 1, y: 2 },
    ],
  },
  {
    start: 270,
    end: 180,
    offset: [
      { x: 0, y: 0 },
      { x: -1, y: 0 },
      { x: -1, y: 1 },
      { x: 0, y: -2 },
      { x: -1, y: -2 },
    ],
  },
  {
    start: 270,
    end: 0,
    offset: [
      { x: 0, y: 0 },
      { x: -1, y: 0 },
      { x: -1, y: 1 },
      { x: 0, y: -2 },
      { x: -1, y: -2 },
    ],
  },
  {
    start: 0,
    end: 270,
    offset: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: -1 },
      { x: 0, y: 2 },
      { x: 1, y: 2 },
    ],
  },
];

// SRS I 블록 알고리즘
export const SRS_I = [
  {
    start: 0,
    end: 90,
    offset: [
      { x: 0, y: 0 },
      { x: -2, y: 0 },
      { x: 1, y: 0 },
      { x: -2, y: 1 },
      { x: 1, y: -2 },
    ],
  },
  {
    start: 90,
    end: 0,
    offset: [
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: -1, y: 0 },
      { x: 2, y: -1 },
      { x: -1, y: 2 },
    ],
  },
  {
    start: 90,
    end: 180,
    offset: [
      { x: 0, y: 0 },
      { x: -1, y: 0 },
      { x: 2, y: 0 },
      { x: -1, y: -2 },
      { x: 2, y: 1 },
    ],
  },
  {
    start: 180,
    end: 90,
    offset: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: -2, y: 0 },
      { x: 1, y: 2 },
      { x: -2, y: -1 },
    ],
  },
  {
    start: 180,
    end: 270,
    offset: [
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: -1, y: 0 },
      { x: 2, y: -1 },
      { x: -1, y: 2 },
    ],
  },
  {
    start: 270,
    end: 180,
    offset: [
      { x: 0, y: 0 },
      { x: -2, y: 0 },
      { x: 1, y: 0 },
      { x: -2, y: 1 },
      { x: 1, y: -2 },
    ],
  },
  {
    start: 270,
    end: 0,
    offset: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: -2, y: 0 },
      { x: 1, y: 2 },
      { x: -2, y: -1 },
    ],
  },
  {
    start: 0,
    end: 270,
    offset: [
      { x: 0, y: 0 },
      { x: -1, y: 0 },
      { x: 2, y: 0 },
      { x: -1, y: -2 },
      { x: 2, y: 1 },
    ],
  },
];

// 보드의 크기만큼 배열을 만들어주는 함수
export const getEmptyArray = (ROWS: number, COLS: number) => {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
};

const TETROMINO_INDEX = [0, 1, 2, 3, 4, 5, 6];

// 랜덤으로 테트로미노 뽑기
export const randomTetromino = () => {
  const tmpArr = TETROMINO_INDEX.slice();
  const randomBlocks = [];

  while (tmpArr.length > 0) {
    randomBlocks.push(
      tmpArr.splice(Math.floor(Math.random() * tmpArr.length), 1)[0]
    );
  }

  return randomBlocks;
};

//tetris 배열 outrange 검사
export const withInRange = (x: number, y: number) => {
  return 0 <= x && x < COLS && 0 <= y && y < ROWS;
};
