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

const drawBlock = (block: blockInterface, ctx: CanvasRenderingContext2D, img: HTMLImageElement) => {
  ctx.clearRect(0, 0, TETRIS.BOARD_WIDTH, TETRIS.BOARD_HEIGHT);

  block.shape.forEach((row:Array<number>, y:number) => {
    row.forEach((value:number, x:number) => {
      if (value > 0) {
          ctx.drawImage(img, TETRIS.BLOCK_ONE_SIZE * block.color, 0, TETRIS.BLOCK_ONE_SIZE, TETRIS.BLOCK_ONE_SIZE, block.posX+(x * TETRIS.BOARD_ONE_SIZE), block.posY+(y * TETRIS.BOARD_ONE_SIZE),TETRIS.BLOCK_ONE_SIZE,TETRIS.BLOCK_ONE_SIZE);
      }
    });
  });
}

const blockConflictCheck = (block: blockInterface, width: number, height: number) => {
  return block.shape.every((row:Array<number>, y:number) => {
    return row.every((value: number, x: number) => {
      const nX: number = block.posX + (x * TETRIS.BOARD_ONE_SIZE);
      const nY: number = block.posY + (y * TETRIS.BOARD_ONE_SIZE);
      return (value === 0 || (0 <= nX && nX < width && 0 <= nY && nY < height));
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

  if(isRight) block.shape.forEach((row: Array<number>) => row.reverse());
  else [block.shape[0],block.shape[2]] = [block.shape[2],block.shape[0]];
  return block;
}

const SRSAlgorithm = (SRS: Array<SRSInterface>, block: blockInterface, key: string) => {
  const dir: number = key === 'ArrowUp' ? 90 : -90;
  const start: number = block.dir;
  let end: number = start;

  if(key === 'ArrowUp') {
    end = block.dir + dir === 360 ? 0 : block.dir + dir
  }
  else {
    end = block.dir + dir === -90 ? 270 : block.dir + dir
  }

  for(let i = 0; i < SRS.length; i++) { // 맞는 방향 비교
    if(!(SRS[i].start === start && SRS[i].end === end)) continue;

    for(let j = 0; j < SRS[i].offset.length; j++) { // offset 비교
      let x: number = SRS[i].offset[j].x;
      let y: number = SRS[i].offset[j].y;

      let nextBlock = JSON.parse(JSON.stringify(block));
      nextBlock.posX += x * TETRIS.BOARD_ONE_SIZE;
      nextBlock.posY += y * TETRIS.BOARD_ONE_SIZE;

      if(blockConflictCheck(nextBlock, TETRIS.BOARD_REAL_WIDTH, TETRIS.BOARD_REAL_HEIGHT)) {
        nextBlock.dir = end;
        return nextBlock;
      }
    }
  }
  return block;
}

const RealBoard = (): JSX.Element =>{
  const canvasContainer = useRef<HTMLCanvasElement>(null);

  const moves = {
    [TETRIS.KEY.LEFT]: (prev: blockInterface) => ({ ...prev, posX: prev.posX - TETRIS.BOARD_ONE_SIZE }),
    [TETRIS.KEY.RIGHT]: (prev: blockInterface) => ({ ...prev, posX: prev.posX + TETRIS.BOARD_ONE_SIZE }),
    [TETRIS.KEY.DOWN]: (prev: blockInterface) => ({ ...prev, posY: prev.posY + TETRIS.BOARD_ONE_SIZE }),
    [TETRIS.KEY.TURN_RIGHT]: (prev: blockInterface) => (rotate(JSON.parse(JSON.stringify(prev)), true)),
    [TETRIS.KEY.TURN_LEFT]: (prev: blockInterface) => (rotate(JSON.parse(JSON.stringify(prev)), false)),
  };

  useEffect(() => {
    let block : blockInterface = {posX: TETRIS.START_X, posY: TETRIS.START_Y, dir: 0, ...TETRIS.randomTetromino()};
    const canvas = canvasContainer.current as HTMLCanvasElement;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    const img: HTMLImageElement = new Image();
    img.src = 'assets/block.png';

    ctx.clearRect(0, 0, TETRIS.BOARD_WIDTH, TETRIS.BOARD_HEIGHT);

    img.onload = () => {
      drawBlock(block, ctx, img);   
    }

    window.addEventListener('keydown', (event : KeyboardEvent) => {
      if (!moves[event.key]) return;
      const nextBlock = moves[event.key](block);

      switch(event.key){
        case TETRIS.KEY.LEFT:
        case TETRIS.KEY.RIGHT:
        case TETRIS.KEY.DOWN:  
          if(blockConflictCheck(nextBlock, TETRIS.BOARD_REAL_WIDTH, TETRIS.BOARD_REAL_HEIGHT)) {
            block = nextBlock;
            drawBlock(block, ctx, img);
          } 
          break;
        case TETRIS.KEY.TURN_RIGHT:
        case TETRIS.KEY.TURN_LEFT: 
          block = SRSAlgorithm(block.name !== 'I' ? TETRIS.SRS : TETRIS.SRS_I, nextBlock, event.key);
          drawBlock(block, ctx, img);
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