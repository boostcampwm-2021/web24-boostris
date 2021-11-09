import React, { useEffect, useRef } from 'react';
import * as TETRIS from '../../../constants/tetris';
import { drawCell } from '../utils/block';
import { TetrisBlock } from '../types';

const HOLD_BOARD_SIZE = 4 * TETRIS.BLOCK_ONE_SIZE;

function HoldBlock({ holdBlock }: { holdBlock: TetrisBlock | null }) {
  const canvasContainer = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasContainer.current as HTMLCanvasElement;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    ctx.clearRect(0, 0, HOLD_BOARD_SIZE, HOLD_BOARD_SIZE);
    if (!holdBlock) return;

    const img: HTMLImageElement = new Image();
    img.src = 'assets/block.png';

    img.onload = () => {
      drawCell(holdBlock.shape, 0, 0, 1, ctx, img);
    };
  }, [holdBlock]);

  return (
    <div>
      <div className="header__mini">{'> Hold'}</div>
      <canvas width={HOLD_BOARD_SIZE} height={HOLD_BOARD_SIZE} ref={canvasContainer} />
    </div>
  );
}

export default HoldBlock;
