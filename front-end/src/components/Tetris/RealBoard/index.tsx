import React, {useEffect, useRef} from 'react';
import * as TETRIS from '../../../constants/tetris';

interface blockInterface {
  posX: number,
  posY: number,
  dir: number;
  name: string,
  shape: Array<Array<number>>,
  color: number
}

interface offsetInterface {
  x: number,
  y: number
}

interface SRSInterface {
  start: number,
  end: number,
  offset: Array<offsetInterface>
}

const setFreeze = (board: number[][], block: blockInterface) => {
  block.shape.forEach((row:Array<number>, y:number) => {
    row.forEach((value:number, x:number) => {
      if(value > 0) {
        board[block.posY+y][block.posX+x] = block.color;
      }
    });
  });
}

const clearLine = (board: number[][]) => {
  board.forEach((row, y) => {
    if (row.every((value) => value !== 0)) {
      board.splice(y, 1);
      board.unshift(Array(TETRIS.COLS).fill(0));
    }
  });
};

const isBottom = (board: number[][], block: blockInterface) => {
  return block.shape.some((row, y) => {
    return row.some((value: number, x: number) => {
      if (value > 0) {
        let nx = block.posX + x;
        let ny = block.posY + y;
        return (
          (ny + 1 < TETRIS.ROWS && board[ny + 1][nx] !== 0) ||
          ny + 1 >= TETRIS.ROWS
        );
      }
    });
  });
};

const drawGameBoard = (board: number[][], block: blockInterface, ctx: CanvasRenderingContext2D, img: HTMLImageElement) => {
  ctx.clearRect(0, 0, TETRIS.BOARD_WIDTH, TETRIS.BOARD_HEIGHT);
  drawBoard(board, ctx, img);
  drawBlock(block, ctx, img);
}

const drawBlock = (block: blockInterface, ctx: CanvasRenderingContext2D, img: HTMLImageElement) => {
  block.shape.forEach((row:Array<number>, y:number) => {
    row.forEach((value:number, x:number) => {
      if (value > 0) {
        ctx.drawImage(img, TETRIS.BLOCK_ONE_SIZE * value, 0, TETRIS.BLOCK_ONE_SIZE, TETRIS.BLOCK_ONE_SIZE,(block.posX + x) * TETRIS.BOARD_ONE_SIZE, (block.posY+ y) * TETRIS.BOARD_ONE_SIZE,TETRIS.BLOCK_ONE_SIZE,TETRIS.BLOCK_ONE_SIZE);
      }
    });
  });
}

const drawBoard = (board: number[][], ctx: CanvasRenderingContext2D, img: HTMLImageElement) => {
  board.forEach((row:Array<number>, y:number) => {
    row.forEach((value:number, x:number) => {
      if (value > 0) {
        ctx.drawImage(img, TETRIS.BLOCK_ONE_SIZE * value, 0, TETRIS.BLOCK_ONE_SIZE, TETRIS.BLOCK_ONE_SIZE, x * TETRIS.BOARD_ONE_SIZE, y * TETRIS.BOARD_ONE_SIZE,TETRIS.BLOCK_ONE_SIZE,TETRIS.BLOCK_ONE_SIZE);
      }
    });
  });
}

const blockConflictCheck = (block: blockInterface, board: number[][]) => {
  return block.shape.every((row:Array<number>, y:number) => {
    return row.every((value: number, x: number) => {
      const nX: number = block.posX + x;
      const nY: number = block.posY + y;

      if (value === 0) return true;
      if (!(0 <= nX && nX < TETRIS.COLS && 0 <= nY && nY < TETRIS.ROWS)) return false;
      if (0 < board[nY][nX] && board[nY][nX] <= 9) return false;
      return true;
    });
  })
}

const rotate = (block : blockInterface, isRight : boolean) => {
  if(block.name === 'O') return block;

  for (let y = 0; y < block.shape.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [block.shape[x][y], block.shape[y][x]] = [block.shape[y][x], block.shape[x][y]];
    }
  }

  if (isRight) block.shape.forEach((row: Array<number>) => row.reverse());
  else block.shape.reverse();
  return block;
}

const SRSAlgorithm = (SRS: Array<SRSInterface>, block: blockInterface, nextBlock: blockInterface, board: number[][], key: string) => {
  const dir: number = key === 'ArrowUp' ? 90 : -90;
  const start: number = nextBlock.dir;
  let end: number = start;

  if(key === 'ArrowUp') {
    end = nextBlock.dir + dir === 360 ? 0 : nextBlock.dir + dir
  }
  else {
    end = nextBlock.dir + dir === -90 ? 270 : nextBlock.dir + dir
  }

  for(let i = 0; i < SRS.length; i++) { // 맞는 방향 비교
    if(!(SRS[i].start === start && SRS[i].end === end)) continue;

    for(let j = 0; j < SRS[i].offset.length; j++) { // offset 비교
      let tmpBlock = JSON.parse(JSON.stringify(nextBlock));
      tmpBlock.posX += SRS[i].offset[j].x;
      tmpBlock.posY += SRS[i].offset[j].y;

      if(blockConflictCheck(tmpBlock, board)) {
        tmpBlock.dir = end;
        return tmpBlock;
      }
    }
  }
  return block;
}

const RealBoard = (): JSX.Element =>{
  const canvasContainer = useRef<HTMLCanvasElement>(null);

  const moves = {
    [TETRIS.KEY.LEFT]: (prev: blockInterface) => ({ ...prev, posX: prev.posX - 1 }),
    [TETRIS.KEY.RIGHT]: (prev: blockInterface) => ({ ...prev, posX: prev.posX + 1 }),
    [TETRIS.KEY.DOWN]: (prev: blockInterface) => ({ ...prev, posY: prev.posY + 1 }),
    [TETRIS.KEY.TURN_RIGHT]: (prev: blockInterface) => (rotate(JSON.parse(JSON.stringify(prev)), true)),
    [TETRIS.KEY.TURN_LEFT]: (prev: blockInterface) => (rotate(JSON.parse(JSON.stringify(prev)), false)),
  };


  useEffect(() => {
    const blockQueue: Array<blockInterface> = [];    
    for(let i=0; i<5; i++) blockQueue.push({ posX: TETRIS.START_X, posY: TETRIS.START_Y, dir: 0, ...TETRIS.randomTetromino() });
    
    let block: blockInterface = { posX: TETRIS.START_X, posY: TETRIS.START_Y, dir: 0, ...TETRIS.randomTetromino() };
    let board = TETRIS.getEmptyArray(TETRIS.ROWS, TETRIS.COLS);
    let beforeBlock: blockInterface;

    let timer :number = 0;
    
    const canvas = canvasContainer.current as HTMLCanvasElement;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    const img: HTMLImageElement = new Image();
    img.src = 'assets/block.png';
    
    ctx.clearRect(0, 0, TETRIS.BOARD_WIDTH, TETRIS.BOARD_HEIGHT);

    let time = 0;

    img.onload = () => {

      drawBoard(board, ctx, img);
      drawBlock(block, ctx, img);
        
      const dropBlock = () => {
        const nextBlock = JSON.parse(JSON.stringify(block));
        //timer += 0.9;
        if (blockConflictCheck({...nextBlock, posY: nextBlock.posY + 1}, board)) { // 전체 범위 검사
          nextBlock.posY += 1;
          drawGameBoard(board, nextBlock, ctx, img);
          beforeBlock = block;
          block = nextBlock;
        }
        else {
          beforeBlock = block;
        }
      }

      const start = setInterval(dropBlock, 900);

      let drop: any;

      const conflictCheck = setInterval(() => {  
        if(isBottom(board, block)) {
          console.log(timer);
          console.log(block);
          console.log(beforeBlock);
          if(JSON.stringify(block) === JSON.stringify(beforeBlock)) {
            if(drop) {
              clearInterval(drop);
            }
            if(start) {
              clearInterval(start);
            }
            setFreeze(board, block);
            clearLine(board);
            block = blockQueue.shift() as blockInterface;
            blockQueue.push({
              posX: TETRIS.START_X,
              posY: TETRIS.START_Y,
              dir: 0,
              ...TETRIS.randomTetromino(),
            });
            drawGameBoard(board, block, ctx, img);
            timer = 0;
            drop = setInterval(dropBlock, 900);
          }
        }
        timer += 0.5;
        
        if(timer >= 20) {
          // 블록을 가장 하단으로 땡겨서 쌓기 구현 필요
          if(drop) {
            clearInterval(drop);
          }
          setFreeze(board, block);
          clearLine(board);
          block = blockQueue.shift() as blockInterface;
          blockQueue.push({
            posX: TETRIS.START_X,
            posY: TETRIS.START_Y,
            dir: 0,
            ...TETRIS.randomTetromino(),
          });
          drawGameBoard(board, block, ctx, img);
          timer = 0;
          drop = setInterval(dropBlock, 900);
        }

      }, 500);
    }

    window.addEventListener('keydown', (event : KeyboardEvent) => {
      if (!moves[event.key]) return;
      const nextBlock = moves[event.key](block);

      switch(event.key){
        case TETRIS.KEY.LEFT:
        case TETRIS.KEY.RIGHT:
        case TETRIS.KEY.DOWN:  
          if(blockConflictCheck(nextBlock, board)) {
            beforeBlock = block;
            block = nextBlock;
            drawGameBoard(board, block, ctx, img);
          }
          break;
        case TETRIS.KEY.TURN_RIGHT:
        case TETRIS.KEY.TURN_LEFT: 
          beforeBlock = block;
          block = SRSAlgorithm(block.name !== 'I' ? TETRIS.SRS : TETRIS.SRS_I, block, nextBlock, board, event.key);
          drawGameBoard(board, block, ctx, img);
          break;
        default: 
          break;
      }
    });
  }, []);

  return (
    <>
      <canvas style={{'position': 'relative'}} className='board' width={TETRIS.BOARD_WIDTH} height={TETRIS.BOARD_HEIGHT} ref={canvasContainer} ></canvas>
    </>
  );
}

export default RealBoard;