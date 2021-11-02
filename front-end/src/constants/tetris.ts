// 게임판 배열
export const BOARD: Array<Array<number>> = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

// 보드 크기 설정
export const COLS: number = 10;
export const ROWS: number = 20;
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
export const START_X: number = 3 * BOARD_ONE_SIZE;
export const START_Y: number = 0;

// KEY 이벤트
export const KEY = {
  LEFT: 'ArrowLeft',
  RIGHT: 'ArrowRight',
  DOWN: 'ArrowDown',
  TURN_RIGHT: 'ArrowUp',
  TURN_LEFT: 'z',  
  HOLD: 'c',
  HARD_DROP: ' '
}

// 테트로미노
export const TETROMINO = [
  {
    name: 'Z',
    shape: [[2, 2, 0], [0, 2, 2], [0, 0, 0]],
    color: 2,
  },
  {
    name: 'L',
    shape: [[0, 0, 3], [3, 3, 3], [0, 0, 0]],
    color: 3
  },
  {
    name: 'O',
    shape: [[0, 4, 4, 0], [0, 4, 4, 0], [0, 0, 0, 0]],
    color: 4
  },
  {
    name: 'S',
    shape: [[0, 5, 5], [5, 5, 0], [0, 0, 0]],
    color: 5
  },
  {
    name: 'I',
    shape: [[0, 0, 0, 0], [6, 6, 6, 6], [0, 0, 0, 0], [0, 0, 0, 0]],
    color: 6
  },
  {
    name: 'J',
    shape: [[7, 0, 0], [7, 7, 7], [0, 0, 0]],
    color: 7
  },
  {
    name: 'T',
    shape: [[0, 8, 0], [8, 8, 8], [0, 0, 0]],
    color: 8
  }
]

// SRS J, L, S, T, Z, O 블록 알고리즘
export const SRS = [
  {start: 0, end: 90, offset: [{x: 0, y: 0}, {x: -1, y: 0}, {x: -1, y: -1}, {x: 0, y: 2}, {x: -1, y: 2}]},
  {start: 90, end: 0, offset: [{x: 0, y: 0}, {x: 1, y: 0}, {x: 1, y: 1}, {x: 0, y: -2}, {x: 1, y: -2}]},
  {start: 90, end: 180, offset: [{x: 0, y: 0}, {x: 1, y: 0}, {x: 1, y: 1}, {x: 0, y: -2}, {x: 1, y: -2}]},
  {start: 180, end: 90, offset: [{x: 0, y: 0}, {x: -1, y: 0}, {x: -1, y: -1}, {x: 0, y: 2}, {x: -1, y: 2}]},
  {start: 180, end: 270, offset: [{x: 0, y: 0}, {x: 1, y: 0}, {x: 1, y: -1}, {x: 0, y: 2}, {x: 1, y: 2}]},
  {start: 270, end: 180, offset: [{x: 0, y: 0}, {x: -1, y: 0}, {x: -1, y: 1}, {x: 0, y: -2}, {x: -1, y: -2}]},
  {start: 270, end: 0, offset: [{x: 0, y: 0}, {x: -1, y: 0}, {x: -1, y: 1}, {x: 0, y: -2}, {x: -1, y: -2}]},
  {start: 0, end: 270, offset: [{x: 0, y: 0}, {x: 1, y: 0}, {x: 1, y: -1}, {x: 0, y: 2}, {x: 1, y: 2}]}
];

// SRS I 블록 알고리즘
export const SRS_I = [
  {start: 0, end: 90, offset: [{x: 0, y: 0}, {x: -2, y: 0}, {x: 1, y: 0}, {x: -2, y: 1}, {x: 1, y: -2}]},
  {start: 90, end: 0, offset: [{x: 0, y: 0}, {x: 2, y: 0}, {x: -1, y: 0}, {x: 2, y: -1}, {x: -1, y: 2}]},
  {start: 90, end: 180, offset: [{x: 0, y: 0}, {x: -1, y: 0}, {x: 2, y: 0}, {x: -1, y: -2}, {x: 2, y: 1}]},
  {start: 180, end: 90, offset: [{x: 0, y: 0}, {x: 1, y: 0}, {x: -2, y: 0}, {x: 1, y: 2}, {x: -2, y: -1}]},
  {start: 180, end: 270, offset: [{x: 0, y: 0}, {x: 2, y: 0}, {x: -1, y: 0}, {x: 2, y: -1}, {x: -1, y: 2}]},
  {start: 270, end: 180, offset: [{x: 0, y: 0}, {x: -2, y: 0}, {x: 1, y: 0}, {x: -2, y: 1}, {x: 1, y: -2}]},
  {start: 270, end: 0, offset: [{x: 0, y: 0}, {x: 1, y: 0}, {x: -2, y: 0}, {x: 1, y: 2}, {x: -2, y: -1}]},
  {start: 0, end: 270, offset: [{x: 0, y: 0}, {x: -1, y: 0}, {x: 2, y: 0}, {x: -1, y: -2}, {x: 2, y: 1}]}
];

// 보드의 크기만큼 배열을 만들어주는 함수
export const getEmptyArray = (ROWS: number, COLS: number) => {
  return Array.from(
    { length: ROWS }, () => Array(COLS).fill(0)
  )
}

// 랜덤으로 테트로미노 뽑기
export const randomTetromino = () => {
  return TETROMINO[Math.floor(Math.random() * 7)];
}