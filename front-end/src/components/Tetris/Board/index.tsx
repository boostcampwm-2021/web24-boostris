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
      posY: TETRIS.START_Y - 1,
      dir: 0,
      ...TETRIS.TETROMINO[block],
    });
  });

  return queue;
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
  ghost: blockInterface,
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement
) => {
  drawBoard(board, ctx, img);
  drawBlock(board, block, ghost, ctx, img);
};

const drawBlock = (
  board: number[][],
  block: blockInterface,
  ghost: blockInterface,
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement
) => {
  block.shape.forEach((row: Array<number>, y: number) => {
    ctx.globalAlpha = 1;
    row.forEach((value: number, x: number) => {
      const nX: number = block.posX + x;
      const nY: number = block.posY + y;

      if (TETRIS.withInRange(nX, nY) && board[nY][nX] === 0) {
        ctx.drawImage(
          img,
          TETRIS.BLOCK_ONE_SIZE * (value - 1),
          0,
          TETRIS.BLOCK_ONE_SIZE,
          TETRIS.BLOCK_ONE_SIZE,
          (block.posX + x) * TETRIS.BOARD_ONE_SIZE,
          (block.posY + y - TETRIS.START_Y) * TETRIS.BOARD_ONE_SIZE,
          TETRIS.BLOCK_ONE_SIZE,
          TETRIS.BLOCK_ONE_SIZE
        );
      }
    });
  });

  ctx.globalAlpha = 0.7;
  ghost.shape.forEach((row: Array<number>, y: number) => {
    row.forEach((value: number, x: number) => {
      const nX: number = ghost.posX + x;
      const nY: number = ghost.posY + y;

      if (TETRIS.withInRange(nX, nY) && board[nY][nX] === 0) {
        ctx.drawImage(
          img,
          TETRIS.BLOCK_ONE_SIZE * (value - 1),
          0,
          TETRIS.BLOCK_ONE_SIZE,
          TETRIS.BLOCK_ONE_SIZE,
          (ghost.posX + x) * TETRIS.BOARD_ONE_SIZE,
          (ghost.posY + y - TETRIS.START_Y) * TETRIS.BOARD_ONE_SIZE,
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
  ctx.globalAlpha = 1;
  ctx.clearRect(0, 0, TETRIS.BOARD_WIDTH, TETRIS.BOARD_HEIGHT);
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
          (y - TETRIS.START_Y) * TETRIS.BOARD_ONE_SIZE,
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

const isGameOver = (board: number[][], block: blockInterface) => {
  const gameOverArr = board.slice(0, 4);

  const outRange = gameOverArr.every((row: Array<number>, y: number) => {
    // 블록의 범위 검사
    return row.every((value: number, x: number) => value !== 0);
  });

  const overlapBlock = block.shape.some((row: number[], y: number) => {
    // 블록이 겹치는지 검사
    return row.some((value: number, x: number) => {
      const nX = block.posX + x;
      const nY = block.posY + y;

      return value > 0 && board[nY][nX] !== 0; // 겹치면 true 반환
    });
  });

  return outRange || overlapBlock;
};

const gameoverBlocks = (board: number[][]) => {
  for (let i = 0; i < board.length; i++)
    for (let j = 0; j < board[i].length; j++)
      if (board[i][j] !== 0) board[i][j] = 1;
};

const hardDropBlock = (board: number[][], block: blockInterface) => {
  const nextBlock = JSON.parse(JSON.stringify(block));

  while (true) {
    if (isBottom(board, nextBlock)) {
      break;
    }
    nextBlock.posY += 1;
  }

  return nextBlock;
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
  [TETRIS.KEY.HOLD]: (prev: blockInterface) => prev,
  [TETRIS.KEY.HARD_DROP]: (prev: blockInterface) => prev,
};

const Board = ({
  gameStart,
  endGame,
  getHoldBlockState,
  getPreviewBlocksList,
}: {
  gameStart: boolean;
  endGame: () => void;
  getHoldBlockState: (newBlock: blockInterface) => void;
  getPreviewBlocksList: (newBlocks: Array<blockInterface>) => void;
}): JSX.Element => {
  const canvasContainer = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!gameStart) return;

    const board = TETRIS.getEmptyArray(TETRIS.ROWS, TETRIS.COLS);
    const blockQueue: Array<blockInterface> = getPreviewBlocks();
    let nowBlock = blockQueue.shift() as blockInterface;
    let ghostBlock = hardDropBlock(board, nowBlock);

    getPreviewBlocksList(blockQueue);
    let beforeBlock: blockInterface;
    let holdBlock: blockInterface;
    let holdBlockFlag = true;

    let timer: number = 0;
    let solidBlocks = 0;

    // 타이머
    let drop: NodeJS.Timeout;
    let conflictCheck: NodeJS.Timeout;

    const canvas = canvasContainer.current as HTMLCanvasElement;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    const img: HTMLImageElement = new Image();
    img.src = 'assets/block.png';

    ctx.clearRect(0, 0, TETRIS.BOARD_WIDTH, TETRIS.BOARD_HEIGHT);

    const dropBlock = () => {
      const nextBlock = JSON.parse(JSON.stringify(nowBlock));
      beforeBlock = nowBlock;

      if (isNotConflict({ ...nextBlock, posY: nextBlock.posY + 1 }, board)) {
        nextBlock.posY += 1;
        draw(board, nextBlock, ghostBlock, ctx, img);
        nowBlock = nextBlock;
        ghostBlock = hardDropBlock(board, nowBlock);
      }
    };

    img.onload = () => {
      draw(board, nowBlock, ghostBlock, ctx, img);

      drop = setInterval(dropBlock, 900);

      conflictCheck = setInterval(() => {
        if (isBottom(board, nowBlock)) {
          if (JSON.stringify(nowBlock) === JSON.stringify(beforeBlock)) {
            if (drop) {
              clearInterval(drop);
            }

            setFreeze(board, nowBlock);
            clearLine(board);

            const nextBlock = blockQueue.shift() as blockInterface;
            getPreviewBlocksList(blockQueue);

            //gameover
            if (isGameOver(board, nextBlock)) {
              clearInterval(drop);
              clearInterval(conflictCheck);
              gameoverBlocks(board);
              drawBoard(board, ctx, img);
              endGame();
              return;
            }

            nowBlock = nextBlock;

            if (blockQueue.length === 5) {
              blockQueue.push(...getPreviewBlocks());
            }

            setSolidBlock(board, solidBlocks);
            ghostBlock = hardDropBlock(board, nowBlock);
            solidBlocks = 0;
            timer = 0;
            holdBlockFlag = true;
            drop = setInterval(dropBlock, 900);
            draw(board, nowBlock, ghostBlock, ctx, img);
          }
        }
        timer += 0.5;

        if (timer >= 20) {
          if (drop) {
            clearInterval(drop);
          }

          nowBlock = hardDropBlock(board, nowBlock);
          setFreeze(board, nowBlock);
          clearLine(board);

          const nextBlock = blockQueue.shift() as blockInterface;
          getPreviewBlocksList(blockQueue);

          //gameover
          if (isGameOver(board, nextBlock)) {
            clearInterval(drop);
            clearInterval(conflictCheck);
            gameoverBlocks(board);
            drawBoard(board, ctx, img);
            endGame();
            return;
          }

          nowBlock = nextBlock;
          ghostBlock = hardDropBlock(board, nowBlock);

          if (blockQueue.length === 5) {
            blockQueue.push(...getPreviewBlocks());
          }

          setSolidBlock(board, solidBlocks);
          ghostBlock = hardDropBlock(board, nowBlock);
          solidBlocks = 0;
          timer = 0;
          holdBlockFlag = true;
          drop = setInterval(dropBlock, 900);
          draw(board, nowBlock, ghostBlock, ctx, img);
        }
      }, 500);
    };

    const solidBlockTimer = setTimeout(() => {
      // Solid Garbage 생성 타이머
      setInterval(() => {
        solidBlocks++;
      }, 5000);
    }, 120000);

    let keydown = false;

    const keyEventHandler = (event: KeyboardEvent) => {
      if (
        !moves[event.key] &&
        !(event.key === TETRIS.KEY.HOLD || event.key === TETRIS.KEY.HARD_DROP)
      )
        return;

      let nextBlock = moves[event.key](nowBlock);

      switch (event.key) {
        case TETRIS.KEY.LEFT:
        case TETRIS.KEY.RIGHT:
        case TETRIS.KEY.DOWN:
          if (isNotConflict(nextBlock, board)) {
            beforeBlock = nowBlock;
            nowBlock = nextBlock;
            ghostBlock = hardDropBlock(board, nowBlock);
            draw(board, nowBlock, ghostBlock, ctx, img);
          }
          break;
        case TETRIS.KEY.TURN_RIGHT:
        case TETRIS.KEY.TURN_LEFT:
          if (keydown) return;
          keydown = true;
          beforeBlock = nowBlock;
          nowBlock = SRSAlgorithm(
            nowBlock.name !== 'I' ? TETRIS.SRS : TETRIS.SRS_I,
            nowBlock,
            nextBlock,
            board,
            event.key
          );
          ghostBlock = hardDropBlock(board, nowBlock);
          draw(board, nowBlock, ghostBlock, ctx, img);
          break;
        case TETRIS.KEY.HOLD: // 홀드
          if (holdBlockFlag) {
            holdBlockFlag = false;

            if (!holdBlock) {
              holdBlock = {
                posX: TETRIS.START_X,
                posY: TETRIS.START_Y - 1,
                dir: 0,
                ...TETRIS.TETROMINO[nowBlock.index],
              };
              nowBlock = blockQueue.shift() as blockInterface;
              ghostBlock = hardDropBlock(board, nowBlock);
              if (blockQueue.length === 5) {
                blockQueue.push(...getPreviewBlocks());
              }
              draw(board, nowBlock, ghostBlock, ctx, img);
              getHoldBlockState(holdBlock);
            } else {
              const tmp = holdBlock;
              holdBlock = {
                posX: TETRIS.START_X,
                posY: TETRIS.START_Y - 1,
                dir: 0,
                ...TETRIS.TETROMINO[nowBlock.index],
              };
              nowBlock = tmp;
              ghostBlock = hardDropBlock(board, nowBlock);
              draw(board, nowBlock, ghostBlock, ctx, img);
              getHoldBlockState(holdBlock);
            }
          }
          break;
        case TETRIS.KEY.HARD_DROP: // 하드 드롭
          if (keydown) return;
          keydown = true;

          if (drop) {
            clearInterval(drop);
          }

          nowBlock = hardDropBlock(board, nowBlock);

          setFreeze(board, nowBlock);
          clearLine(board);

          const tmp = blockQueue.shift() as blockInterface;
          getPreviewBlocksList(blockQueue);
          // gameover
          if (isGameOver(board, tmp)) {
            clearInterval(drop);
            clearInterval(conflictCheck);
            gameoverBlocks(board);
            drawBoard(board, ctx, img);
            endGame();
            return;
          }

          nowBlock = tmp;

          if (blockQueue.length === 5) {
            blockQueue.push(...getPreviewBlocks());
          }

          setSolidBlock(board, solidBlocks);
          ghostBlock = hardDropBlock(board, nowBlock);
          solidBlocks = 0;
          timer = 0;
          holdBlockFlag = true;
          drop = setInterval(dropBlock, 900);
          draw(board, nowBlock, ghostBlock, ctx, img);
          break;
        default:
          break;
      }
    };

    const keyUpEventHandler = () => {
      keydown = false;
    };

    window.addEventListener('keydown', keyEventHandler);
    window.addEventListener('keyup', keyUpEventHandler);
    return () => {
      window.removeEventListener('keydown', keyEventHandler);
      window.removeEventListener('keyup', keyUpEventHandler);
    };
  }, [gameStart]);

  return (
    <canvas
      style={{
        position: 'relative',
        background: `url(assets/board.png)`,
      }}
      className="board"
      width={TETRIS.BOARD_WIDTH}
      height={TETRIS.BOARD_HEIGHT}
      ref={canvasContainer}
    ></canvas>
  );
};

export default Board;
