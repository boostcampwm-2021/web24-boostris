import React, { useEffect, useRef } from 'react';
import * as TETRIS from '../../../constants/tetris';

interface blockInterface {
  posX: number;
  posY: number;
  dir: number;
  name: string;
  shape: Array<Array<number>>;
  color: number;
}

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

const getCanvasSize = (block: blockInterface) => {
  let height = block.shape.length * TETRIS.BLOCK_ONE_SIZE;
  let width = block.shape[0].length * TETRIS.BLOCK_ONE_SIZE;
  return [height, width];
};

function HoldBlock({ holdBlock }: { holdBlock: blockInterface }) {
  const canvasContainer = useRef<HTMLCanvasElement>(null);
  const [HOLDBOARD_HEIGHT, HOLDBOARD_WIDTH] = getCanvasSize(holdBlock);

  useEffect(() => {
    const canvas = canvasContainer.current as HTMLCanvasElement;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

    const img: HTMLImageElement = new Image();
    img.src = 'assets/block.png';

    img.onload = () => {
      ctx.clearRect(0, 0, HOLDBOARD_WIDTH, HOLDBOARD_HEIGHT);
      drawBlock(holdBlock, ctx, img);
    };
  }, [holdBlock]);

  return (
    <div>
      <canvas
        width={HOLDBOARD_WIDTH}
        height={HOLDBOARD_HEIGHT}
        ref={canvasContainer}
      />
    </div>
  );
}

export default HoldBlock;
