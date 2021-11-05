export interface blockInterface {
  posX: number;
  posY: number;
  dir: number;
  name: string;
  shape: Array<Array<number>>;
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
