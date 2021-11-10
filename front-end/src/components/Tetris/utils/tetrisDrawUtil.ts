export const drawBoardBackground = (canvas: HTMLCanvasElement | null, width: number, height: number, blockSize: number) => {
  const ctx = canvas?.getContext('2d') as CanvasRenderingContext2D;

  ctx.strokeStyle = '#555555';
  ctx.lineWidth = 1;
  ctx.translate(0.5, 0.5);

  for(let i = 0; i <= 20; i++) { // 가로 선
    ctx.moveTo(0, i * blockSize);
    ctx.lineTo(width, i * blockSize);
  }

  for(let i = 0; i <= 10; i++) { // 세로 선
    ctx.moveTo(i * blockSize, 0);
    ctx.lineTo(i * blockSize, height);
  }
  
  ctx.stroke();
}