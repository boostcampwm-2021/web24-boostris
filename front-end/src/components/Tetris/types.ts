export interface Block {
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
  NOW: Block;
  BEFORE: Block;
  NEXT: Block;
  GHOST: Block;
  HOLD: Block;
}

export interface TetrisState {
  QUEUE: Block[];
  CAN_HOLD: boolean;
  SOLID_GARBAGES: number;
  KEYDOWN: boolean;
}

export interface TetrisTimer {
  PLAY_TIME: number;
  DROP: NodeJS.Timeout;
  CONFLICT: NodeJS.Timeout;
  SOLID_GARBAGE: NodeJS.Timeout;
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