export interface TetrisBlock {
  posX: number;
  posY: number;
  dir: number;
  name: string;
  shape: number[][];
  color: number;
  index: number;
}

export interface offsetInterface {
  x: number;
  y: number;
}

export interface SRSInterface {
  start: number;
  end: number;
  offset: Array<offsetInterface>;
}

export interface TetrisBlocks {
  NOW: TetrisBlock;
  BEFORE: TetrisBlock;
  NEXT: TetrisBlock;
  GHOST: TetrisBlock;
  HOLD: TetrisBlock;
}

export interface TetrisState {
  QUEUE: TetrisBlock[];
  CAN_HOLD: boolean;
  SOLID_GARBAGES: number;
  ATTACKED_GARBAGES: number;
  KEYDOWN_TURN_RIGHT: boolean;
  KEYDOWN_TURN_LEFT: boolean;
  KEYDOWN_HARD_DROP: boolean;
}

export interface TetrisTimer {
  PLAY_TIME: number;
  DROP: NodeJS.Timeout;
  CONFLICT: NodeJS.Timeout;
  SOLID_GARBAGE_TIMEOUT: NodeJS.Timeout,
  SOLID_GARBAGE_INTERVAL: NodeJS.Timeout;
}

export interface TetrisBackground {
  CANVAS: HTMLCanvasElement;
  CTX: CanvasRenderingContext2D;
  IMAGE: HTMLImageElement;
}

export interface TetrisOptions {
  TIME_OUT: string;
  HARD_DROP: string;
}

export interface TetrisPropsFunc {
  HOLD_FUNC: (newBlock: TetrisBlock) => void;
  PREVIEW_FUNC: (newBlocks: null | Array<TetrisBlock>) => void;
  GAMEOVER_FUNC: () => void;
}
