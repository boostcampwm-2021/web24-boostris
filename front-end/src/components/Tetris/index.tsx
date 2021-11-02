import React, {useEffect, useRef} from 'react';
import Board from './Board';
import RealBoard from './RealBoard';
  
const Tetris = () :JSX.Element=> {
  return (
    <>
      <div className="tetris">
        <Board/>
        <RealBoard/>
      </div>
    </>
  )
}
export default Tetris;