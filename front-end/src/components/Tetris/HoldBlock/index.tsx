import React, { useEffect, useRef } from 'react';
import * as TETRIS from '../../../constants/tetris';

interface blockInterface {
  posX: number;
  posY: number;
  dir: number;
  name: string;
  shape: Array<Array<number>>;
  color: number;
  index: number;
}

const HOLD_BOARD_SIZE = 4 * TETRIS.BLOCK_ONE_SIZE;

const drawBlock = (
  block: blockInterface,
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement
) => {
  block.shape.forEach((row: Array<number>, y: number) => {
    row.forEach((value: number, x: number) => {
      ctx.drawImage(
        img,
        TETRIS.BLOCK_ONE_SIZE * (value - 1),
        0,
        TETRIS.BLOCK_ONE_SIZE,
        TETRIS.BLOCK_ONE_SIZE,
        x * TETRIS.BOARD_ONE_SIZE,
        y * TETRIS.BOARD_ONE_SIZE,
        TETRIS.BLOCK_ONE_SIZE,
        TETRIS.BLOCK_ONE_SIZE
      );
    });
  });
};

function HoldBlock({ holdBlock }: { holdBlock: blockInterface | null }) {
  const canvasContainer = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasContainer.current as HTMLCanvasElement;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    ctx.clearRect(0, 0, HOLD_BOARD_SIZE, HOLD_BOARD_SIZE);
    if (!holdBlock) return;

    const img: HTMLImageElement = new Image();
    img.src = 'assets/block.png';

    img.onload = () => {
      drawBlock(holdBlock, ctx, img);
    };
  }, [holdBlock]);

  return (
    <canvas
      width={HOLD_BOARD_SIZE}
      height={HOLD_BOARD_SIZE}
      ref={canvasContainer}
    />
  );
}

export default HoldBlock;
