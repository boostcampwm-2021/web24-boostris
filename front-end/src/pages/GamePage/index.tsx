import { nanoid } from '@reduxjs/toolkit';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Socket } from 'socket.io-client';
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
import SEO from '../../components/SEO';
import Modal from '../../components/Modal';
import RankTable from '../../components/Tetris/RankTable';

interface blockInterface {
  posX: number;
  posY: number;
  dir: number;
  name: string;
  shape: Array<Array<number>>;
  color: number;
  index: number;
}

interface RankInterface {
  nickname: string,
  playTime: number,
  attackCnt: number,
  attackedCnt: number
}

function GamePage() {
  const { gameID } = useParams();
  const { roomID, rooms, roomMessages } = useAppSelector(selectSocket);
  const dispatch = useAppDispatch();
  const socketClient = useSocket();
  const { profile } = useAuth();
  const {isReady, isStartedGame, setIsStartedGame} = useSocketReady();
  const chatInputRef = useRef<any>();
  const containerRef = useRef<any>();

  const [isGameStarted, setIsGameStarted] = useState(false);
  const [gameStart, setgameStart] = useState(false);
  const [gameOver, setGameOver] = useState(true);
  const [holdBlock, setHoldBlock] = useState<blockInterface | null>(null);
  const [previewBlock, setPreviewBlock] = useState<Array<blockInterface> | null>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  const modalRef = useRef<any>();
  const [rank, setRankState] = useState<RankInterface[]>();

  let rankIdx = 1;

  const handleRankModal = () => {
    modalRef.current.open();
  };

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
    socket.emit('game start', roomID);
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
    if(!isReady) return;
    drawBoardBackground(canvas.current, TETRIS.BOARD_WIDTH, TETRIS.BOARD_HEIGHT, TETRIS.BLOCK_SIZE);

    let startEvent: () => void;
    let gameOverEvent: () => void;
    let rankTableEvent: (rank: RankInterface[]) => void;

    socketClient.current.on('game started', startEvent = () => {
      // 다른 플레이어가 게임 시작 누르는 것 감지
      setgameStart(false);
      setgameStart(true);
      setGameOver(false);
      setHoldBlock(null);
      setPreviewBlock(null);
    });

    socketClient.current.on('every player game over', gameOverEvent = () => {
      // 모든 플레이어가 게임 종료 된 경우
      setGameOver(true);
      setIsStartedGame(false);
    });

    socketClient.current.on('send rank table', rankTableEvent = (rank: RankInterface[]) => {
      setRankState(rank);
    });

    return () => {
      socketClient.current.off('game started', startEvent);
      socketClient.current.off('every player game over', gameOverEvent);
      socketClient.current.off('send rank table', rankTableEvent);
    }
  }, [isReady]);

  useEffect(() => {
    if(!rank) return;
    handleRankModal();
  }, [rank]);

  useEffect(() => {
    const target = rooms.find((r) => r.id === roomID);
  
    if(target?.gameStart) {
      setIsStartedGame(true);
    }
    else {
      setIsStartedGame(false);
    }
  }, []);

  return (
    <AppbarLayout>


      <SEO>
        <title>게임 입장</title>
        <meta property="og:title" content={`게임 ${gameID}`} />
        {/* <meta property="og:url" content="https://www.imdb.com/title/tt0117500/" /> */}
        <meta property="og:image" content="/logo192.png" />
      </SEO>

      {isReady ? (

        <div
          className="game__page--root"
          style={{ width: '1200px', display: 'flex', padding: '50px', backgroundColor: '#2b3150' }}
        >
            <div>
              <HoldBlock holdBlock={holdBlock} />
              <div>
                <div>{'플레이 타임'}</div>
                <div className={'play-time'}>0s</div>
                <div>{'공격 횟수'}</div>
                <div className={'attack-count'}>0</div>
              </div>
            </div>
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
              socket={socketClient.current}
              gameStart={gameStart}
              gameOver={gameOver}
              endGame={() => endGame(socketClient.current)}
              getHoldBlockState={getHoldBlock}
              getPreviewBlocksList={getPreviewBlocks} />
            <div className={'myNickName'}>{profile.nickname}</div>
          </div>
          <div>
            <PreviewBlocks previewBlock={previewBlock} />
            <BubbleButton
              variant={!gameOver || isStartedGame ? 'inactive' : 'active'}
              label="게임 시작"
              handleClick={() => {
                clickStartButton(socketClient.current);
              } }
              disabled={!gameOver || isStartedGame} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="slots">
              <OtherBoard socket={socketClient.current} />
            </div>
            <div>
              <div className="chats__container">
                <div className="chat__history__container">
                  <div className="chat__history__scroll__root fancy__scroll" ref={containerRef}>
                    {roomMessages.map(({ id, from, message }) => (
                      <div key={id} className="chat__history__item">
                        {from === 'socket-server' ? message : `${from} : ${message}`}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="chat__input__container">
                  <input
                    type="text"
                    className="chat__input"
                    onKeyUp={handleSubmit}
                    ref={chatInputRef} />
                  <button className="chat__send__btn" onClick={sendMessage}>
                    전송
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      {rank ?
        (<Modal ref={modalRef} title="게임 결과" type="rank">
          <RankTable rank={rank} />
        </Modal>)
      : null}
    </AppbarLayout>
  );
}

export default GamePage;
