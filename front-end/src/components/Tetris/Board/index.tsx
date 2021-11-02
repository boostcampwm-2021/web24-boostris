import React, {useEffect, useRef} from 'react';
import './style.scss';

const Board = (): JSX.Element =>{
  const canvasContainer = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasContainer.current as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    const img: HTMLImageElement = new Image();
    img.src = `assets/board.png`;
    img.onload = function() {
        ctx?.drawImage(img, 0, 0);
    }
  }, []);

  return (
    <>
      <canvas style={{'position': 'absolute'}} className='board' width='241' height='481' ref={canvasContainer} ></canvas>
    </>
  );
}

export default Board;