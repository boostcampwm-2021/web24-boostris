import { nanoid } from '@reduxjs/toolkit';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { drawBoardBackground } from '../../components/Tetris/utils/tetrisDrawUtil';
import { useSocket, useSocketReady } from '../../context/SocketContext';
import { resetRoomMessages, selectSocket } from '../../features/socket/socketSlice';
import useAuth from '../../hooks/use-auth';
import AppbarLayout from '../../layout/AppbarLayout';
import './style.scss';
import * as TETRIS from '../../constants/tetris';
import HoldBlock from '../../components/Tetris/HoldBlock';
import Board from '../../components/Tetris/Board';
import PreviewBlocks from '../../components/Tetris/PreviewBlocks';
import BubbleButton from '../../components/BubbleButton';
import OtherBoard from '../../components/Tetris/OtherBoard';

interface blockInterface {
  posX: number;
  posY: number;
  dir: number;
  name: string;
  shape: Array<Array<number>>;
  color: number;
  index: number;
}
function GamePage() {
  const { gameID } = useParams();
  const { roomID, roomMembers, roomMessages } = useAppSelector(selectSocket);
  const dispatch = useAppDispatch();
  const socketClient = useSocket();
  const { profile } = useAuth();
  const isReady = useSocketReady();
  const chatInputRef = useRef<any>();
  const containerRef = useRef<any>();

  const [gameStart, setgameStart] = useState(false);
  const [gameOver, setGameOver] = useState(true);
  const [holdBlock, setHoldBlock] = useState<blockInterface | null>(null);
  const [previewBlock, setPreviewBlock] = useState<Array<blockInterface> | null>(null);
  const socketRef = useRef<any>(null);
  const [socketState, setSocketState] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  });

  useEffect(() => {
    const ref = socketClient.current;
    return () => {
      if (ref) {
        ref.emit('leave room', roomID);
        dispatch(resetRoomMessages());
      }
    };
  }, [dispatch, roomID, socketClient]);

  useEffect(() => {
    if (isReady && socketClient.current) {
      if (!roomID) {
        socketClient.current.emit('check valid room', { roomID: gameID, id: socketClient.id });
      }
    }
  }, [isReady, gameID, socketClient, roomID]);

  const handleSubmit: React.KeyboardEventHandler = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };
  const sendMessage = () => {
    if (chatInputRef.current.value.length) {
      socketClient.current.emit('send message', {
        roomID,
        from: profile.nickname,
        message: chatInputRef.current.value,
        id: nanoid(),
      });
      chatInputRef.current.value = '';
    }
  };

  const clickStartButton = (socket: Socket) => {
    socket.emit('game start');
  };

  const endGame = (socket: Socket) => {
    setgameStart(false);
    socket.emit('game over');
  };

  const getHoldBlock = (newBlock: blockInterface) => {
    setHoldBlock({ ...newBlock });
  };

  const getPreviewBlocks = (newBlocks: null | Array<blockInterface>) => {
    setPreviewBlock(JSON.parse(JSON.stringify(newBlocks)));
  };

  useEffect(() => {
    socketRef.current = io('/tetris', {
      transports: ['websocket'],
      path: '/socket.io',
      secure: true,
    });

    socketRef.current.on('connect', () => {
      setSocketState(true);
      socketRef.current.emit('join room', roomID);

      socketRef.current.on('game started', () => {
        // 다른 플레이어가 게임 시작 누르는 것 감지
        setgameStart(false);
        setgameStart(true);
        setGameOver(false);
        setHoldBlock(null);
        setPreviewBlock(null);
      });

      socketRef.current.on('every player game over', () => {
        // 모든 플레이어가 게임 종료 된 경우
        setGameOver(true);
      });
    });
  }, []);

  useEffect(() => {
    if (!canvas.current) return;
    drawBoardBackground(canvas.current, TETRIS.BOARD_WIDTH, TETRIS.BOARD_HEIGHT, TETRIS.BLOCK_SIZE);
  }, [socketState]);
  return (
    <AppbarLayout>
      {socketState ? (
        <div
          className="game__page--root"
          style={{ width: '1200px', display: 'flex', padding: '50px', backgroundColor: '#2b3150' }}
        >
          <HoldBlock holdBlock={holdBlock} />
          <div style={{ position: 'relative', margin: '0px 40px' }}>
            <canvas
              style={{
                position: 'absolute',
              }}
              className="board-background"
              width={TETRIS.BOARD_WIDTH + TETRIS.ATTACK_BAR}
              height={TETRIS.BOARD_HEIGHT}
              ref={canvas}
            ></canvas>
            <Board
              socket={socketRef.current}
              gameStart={gameStart}
              gameOver={gameOver}
              endGame={() => endGame(socketRef.current)}
              getHoldBlockState={getHoldBlock}
              getPreviewBlocksList={getPreviewBlocks}
            />
          </div>
          <div>
            <PreviewBlocks previewBlock={previewBlock} />
            <BubbleButton
              variant={!gameOver ? 'inactive' : 'active'}
              label="게임 시작"
              handleClick={() => {
                clickStartButton(socketRef.current);
              }}
              disabled={!gameOver}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="slots">
              <OtherBoard socket={socketRef.current} />
            </div>
            <div>
              <div>Game# {gameID}</div>
              Members :
              {roomMembers.map((m) => (
                <div key={m.id}>{m.nickname}</div>
              ))}
              <div className="chats__container">
                <div className="chat__history__container">
                  <div className="chat__history__scroll__root fancy__scroll" ref={containerRef}>
                    {roomMessages.map(({ id, from, message }) => (
                      <div key={id} className="chat__history__item">
                        {from} : {message}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="chat__input__container">
                  <input
                    type="text"
                    className="chat__input"
                    onKeyUp={handleSubmit}
                    ref={chatInputRef}
                  />
                  <button className="chat__send__btn" onClick={sendMessage}>
                    전송
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      {/* <div className="game__page--root">
      </div> */}
    </AppbarLayout>
  );
}

export default GamePage;
