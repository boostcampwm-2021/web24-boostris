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

const PREVIEW_BOARD_HEIGHT = 16 * TETRIS.BLOCK_ONE_SIZE;
const PREVIEW_BOARD_WIDTH = 4 * TETRIS.BLOCK_ONE_SIZE;

const drawBlock = (
  block: blockInterface,
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement
) => {
  block.shape.forEach((row: Array<number>, y: number) => {
    row.forEach((value: number, x: number) => {
      if (value > 0) {
        ctx.drawImage(
          img,
          TETRIS.BLOCK_ONE_SIZE * (value - 1),
          0,
          TETRIS.BLOCK_ONE_SIZE,
          TETRIS.BLOCK_ONE_SIZE,
          (block.posX + x) * TETRIS.BOARD_ONE_SIZE,
          (block.posY + y) * TETRIS.BOARD_ONE_SIZE,
          TETRIS.BLOCK_ONE_SIZE,
          TETRIS.BLOCK_ONE_SIZE
        );
      }
    });
  });
};

function PreviewBlocks({
  previewBlock,
}: {
  previewBlock: Array<blockInterface> | null;
}) {
  const canvasContainer = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasContainer.current as HTMLCanvasElement;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    ctx.clearRect(0, 0, PREVIEW_BOARD_WIDTH, PREVIEW_BOARD_HEIGHT);
    if (!previewBlock) return;

    const img: HTMLImageElement = new Image();
    img.src = 'assets/block.png';

    img.onload = () => {
      previewBlock.forEach((block, i) => {
        if (i >= 5) return;
        block.posX = 0;
        block.posY = i * 3;
        drawBlock(block, ctx, img);
      });
    };
  }, [previewBlock]);

  return (
    <canvas
      style={{ display: 'block' }}
      width={PREVIEW_BOARD_WIDTH}
      height={PREVIEW_BOARD_HEIGHT}
      ref={canvasContainer}
    />
  );
}

export default PreviewBlocks;
