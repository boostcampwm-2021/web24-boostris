import * as TETRIS from '../../../constants/tetris';

export const drawCell = (
  shape: number[][],
  X: number,
  Y: number,
  opacity: number,
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement
) => {
  ctx.globalAlpha = opacity;
  shape.forEach((row, dy) => {
    row.forEach((value, dx) => {
      if (value > 0)
        ctx.drawImage(
          img,
          TETRIS.BLOCK_ONE_SIZE * (value - 1),
          0,
          TETRIS.BLOCK_ONE_SIZE,
          TETRIS.BLOCK_ONE_SIZE,
          (X + dx) * TETRIS.BOARD_ONE_SIZE,
          (Y + dy) * TETRIS.BOARD_ONE_SIZE,
          TETRIS.BLOCK_ONE_SIZE,
          TETRIS.BLOCK_ONE_SIZE
        );
    });
  });
};

export const drawOtherCell = (
  shape: number[][],
  X: number,
  Y: number,
  opacity: number,
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement
) => {
  ctx.globalAlpha = opacity;
  shape.forEach((row, dy) => {
    row.forEach((value, dx) => {
      if (value > 0)
        ctx.drawImage(
          img,
          TETRIS.OTHER_BLOCK_ONE_SIZE * (value - 1),
          0,
          TETRIS.OTHER_BLOCK_ONE_SIZE,
          TETRIS.OTHER_BLOCK_ONE_SIZE,
          (X + dx) * TETRIS.OTHER_BOARD_ONE_SIZE,
          (Y + dy) * TETRIS.OTHER_BOARD_ONE_SIZE,
          TETRIS.OTHER_BLOCK_ONE_SIZE,
          TETRIS.OTHER_BLOCK_ONE_SIZE
        );
    });
  });
};
