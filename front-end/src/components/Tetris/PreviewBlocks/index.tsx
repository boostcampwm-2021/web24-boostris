import React, { useEffect, useRef } from 'react';
import * as TETRIS from '../../../constants/tetris';
import { drawCell } from '../utils/block';
import { Block } from '../types';

const PREVIEW_BOARD_HEIGHT = 16 * TETRIS.BLOCK_ONE_SIZE;
const PREVIEW_BOARD_WIDTH = 4 * TETRIS.BLOCK_ONE_SIZE;

function PreviewBlocks({ previewBlock }: { previewBlock: Array<Block> | null }) {
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
        drawCell(block.shape, 0, i * 3, 1, ctx, img);
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
