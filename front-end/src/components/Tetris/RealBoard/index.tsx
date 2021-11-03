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

interface offsetInterface {
  x: number;
  y: number;
}

interface SRSInterface {
  start: number;
  end: number;
  offset: Array<offsetInterface>;
}

const getPreviewBlocks = () => {
  const randomBlocks = TETRIS.randomTetromino();
  const queue: blockInterface[] = [];

  randomBlocks.forEach((block) => {
    queue.push({
      posX: TETRIS.START_X,
      posY: TETRIS.START_Y,
      dir: 0,
      ...TETRIS.TETROMINO[block],
    });
  });

  return queue;
};

const isOverflow = (block: blockInterface) => {
  return block.shape.some((row, y) =>
    row.some((value) => value > 0 && block.posY + y < 0)
  );
};

const setFreeze = (board: number[][], block: blockInterface) => {
  block.shape.forEach((row: Array<number>, y: number) => {
    row.forEach((value: number, x: number) => {
      let nX = block.posX + x;
      let nY = block.posY + y;

      if (value > 0 && TETRIS.withInRange(nX, nY)) {
        board[nY][nX] = block.color;
      }
    });
  });
};

const clearLine = (board: number[][]) => {
  board.forEach((row, y) => {
    if (row.every((value) => value > 1)) {
      board.splice(y, 1);
      board.unshift(Array(TETRIS.COLS).fill(0));
    }
  });
};

const setSolidBlock = (board: number[][], solidBlocks: number) => {
  for (let i = 0; i < solidBlocks; i++) {
    board.shift();
    board.push(Array(TETRIS.COLS).fill(1));
  }
};

const isBottom = (board: number[][], block: blockInterface) => {
  return block.shape.some((row, y) =>
    row.some((value: number, x: number) => {
      if (value > 0) {
        let nX = block.posX + x;
        let nY = block.posY + y;
        if (!TETRIS.withInRange(nX, nY)) return false;

        return (
          (nY + 1 < TETRIS.ROWS && board[nY + 1][nX] !== 0) ||
          nY + 1 >= TETRIS.ROWS
        );
      }
      return false;
    })
  );
};

const draw = (
  board: number[][],
  block: blockInterface,
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement
) => {
  ctx.clearRect(0, 0, TETRIS.BOARD_WIDTH, TETRIS.BOARD_HEIGHT);
  drawBoard(board, ctx, img);
  drawBlock(block, ctx, img);
};

const drawBlock = (
  block: blockInterface,
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement
) => {
  block.shape.forEach((row: Array<number>, y: number) => {
    row.forEach((value: number, x: number) => {
      const nX: number = block.posX + x;
      const nY: number = block.posY + y;

      if (TETRIS.withInRange(nX, nY)) {
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

const drawBoard = (
  board: number[][],
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement
) => {
  board.forEach((row: Array<number>, y: number) => {
    row.forEach((value: number, x: number) => {
      if (value > 0) {
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
      }
    });
  });
};

const isNotConflict = (block: blockInterface, board: number[][]) => {
  return block.shape.every((row: Array<number>, y: number) => {
    return row.every((value: number, x: number) => {
      const nX: number = block.posX + x;
      const nY: number = block.posY + y;
      return value === 0 || (TETRIS.withInRange(nX, nY) && board[nY][nX] === 0);
    });
  });
};

const rotate = (block: blockInterface, isRight: boolean) => {
  if (block.name === 'O') return block;

  for (let y = 0; y < block.shape.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [block.shape[x][y], block.shape[y][x]] = [
        block.shape[y][x],
        block.shape[x][y],
      ];
    }
  }

  if (isRight) block.shape.forEach((row: Array<number>) => row.reverse());
  else block.shape.reverse();
  return block;
};

const SRSAlgorithm = (
  SRS: Array<SRSInterface>,
  block: blockInterface,
  nextBlock: blockInterface,
  board: number[][],
  key: string
) => {
  const dir: number = key === 'ArrowUp' ? 90 : -90;
  const start: number = nextBlock.dir;
  let end: number = start;

  if (key === 'ArrowUp') {
    end = nextBlock.dir + dir === 360 ? 0 : nextBlock.dir + dir;
  } else {
    end = nextBlock.dir + dir === -90 ? 270 : nextBlock.dir + dir;
  }

  for (let i = 0; i < SRS.length; i++) {
    // 맞는 방향 비교
    if (!(SRS[i].start === start && SRS[i].end === end)) continue;

    for (let j = 0; j < SRS[i].offset.length; j++) {
      // offset 비교
      let tmpBlock = JSON.parse(JSON.stringify(nextBlock));
      tmpBlock.posX += SRS[i].offset[j].x;
      tmpBlock.posY += SRS[i].offset[j].y;

      if (isNotConflict(tmpBlock, board)) {
        tmpBlock.dir = end;
        return tmpBlock;
      }
    }
  }
  return block;
};

const moves = {
  [TETRIS.KEY.LEFT]: (prev: blockInterface) => ({
    ...prev,
    posX: prev.posX - 1,
  }),
  [TETRIS.KEY.RIGHT]: (prev: blockInterface) => ({
    ...prev,
    posX: prev.posX + 1,
  }),
  [TETRIS.KEY.DOWN]: (prev: blockInterface) => ({
    ...prev,
    posY: prev.posY + 1,
  }),
  [TETRIS.KEY.TURN_RIGHT]: (prev: blockInterface) =>
    rotate(JSON.parse(JSON.stringify(prev)), true),
  [TETRIS.KEY.TURN_LEFT]: (prev: blockInterface) =>
    rotate(JSON.parse(JSON.stringify(prev)), false),
};

const RealBoard = ({
  gameStart,
  endGame,
}: {
  gameStart: boolean;
  endGame: () => void;
}): JSX.Element => {
  const canvasContainer = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!gameStart) return;
    const blockQueue: Array<blockInterface> = getPreviewBlocks();

    let block = blockQueue.shift() as blockInterface;
    let board = TETRIS.getEmptyArray(TETRIS.ROWS, TETRIS.COLS);
    let beforeBlock: blockInterface;

    let timer: number = 0;
    let solidBlocks = 0;

    const canvas = canvasContainer.current as HTMLCanvasElement;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    const img: HTMLImageElement = new Image();
    img.src = 'assets/block.png';

    ctx.clearRect(0, 0, TETRIS.BOARD_WIDTH, TETRIS.BOARD_HEIGHT);

    img.onload = () => {
      draw(board, block, ctx, img);

      const dropBlock = () => {
        const nextBlock = JSON.parse(JSON.stringify(block));
        beforeBlock = block;

        if (isNotConflict({ ...nextBlock, posY: nextBlock.posY + 1 }, board)) {
          nextBlock.posY += 1;
          draw(board, nextBlock, ctx, img);
          block = nextBlock;
        }
      };

      const start = setInterval(dropBlock, 900);

      let drop: any;

      const conflictCheck = setInterval(() => {
        if (isBottom(board, block)) {
          if (JSON.stringify(block) === JSON.stringify(beforeBlock)) {
            if (drop) {
              clearInterval(drop);
            }
            if (start) {
              clearInterval(start);
            }

            setFreeze(board, block);
            clearLine(board);

            //gameover
            // if (isGameOver(block)) {
            //   clearInterval(drop);
            //   clearInterval(start);
            //   clearInterval(conflictCheck);
            //   //draw gray block
            //   endGame();
            //   return;
            // }

            block = blockQueue.shift() as blockInterface;

            if (blockQueue.length === 5) {
              blockQueue.push(...getPreviewBlocks());
            }

            setSolidBlock(board, solidBlocks);
            solidBlocks = 0;
            timer = 0;
            drop = setInterval(dropBlock, 900);
          }
        }
        timer += 0.5;

        if (timer >= 20) {
          if (drop) {
            clearInterval(drop);
          }
          //gameover
          // if (isGameOver(block)) {
          //   clearInterval(drop);
          //   clearInterval(start);
          //   clearInterval(conflictCheck);
          //   //draw gray block
          //   endGame();
          //   return;
          // }

          setFreeze(board, block);
          clearLine(board);
          block = blockQueue.shift() as blockInterface;

          if (blockQueue.length === 5) {
            blockQueue.push(...getPreviewBlocks());
          }

          setSolidBlock(board, solidBlocks);
          solidBlocks = 0;
          timer = 0;
          drop = setInterval(dropBlock, 900);
          draw(board, block, ctx, img);
        }
      }, 500);
    };

    const solidBlockTimer = setTimeout(() => {
      setInterval(() => {
        solidBlocks++;
      }, 3000);
    }, 120000);

    const keyEventHandler = (event: KeyboardEvent) => {
      if (!moves[event.key]) return;
      const nextBlock = moves[event.key](block);

      switch (event.key) {
        case TETRIS.KEY.LEFT:
        case TETRIS.KEY.RIGHT:
        case TETRIS.KEY.DOWN:
          if (isNotConflict(nextBlock, board)) {
            beforeBlock = block;
            block = nextBlock;
            draw(board, block, ctx, img);
          }
          break;
        case TETRIS.KEY.TURN_RIGHT:
        case TETRIS.KEY.TURN_LEFT:
          beforeBlock = block;
          block = SRSAlgorithm(
            block.name !== 'I' ? TETRIS.SRS : TETRIS.SRS_I,
            block,
            nextBlock,
            board,
            event.key
          );
          draw(board, block, ctx, img);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', keyEventHandler);
    return () => {
      window.removeEventListener('keydown', keyEventHandler);
    };
  }, [gameStart]);

  return (
    <>
      <canvas
        style={{ position: 'relative' }}
        className="board"
        width={TETRIS.BOARD_WIDTH}
        height={TETRIS.BOARD_HEIGHT}
        ref={canvasContainer}
      ></canvas>
    </>
  );
};

export default RealBoard;
