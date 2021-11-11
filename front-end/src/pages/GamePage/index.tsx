import { nanoid } from '@reduxjs/toolkit';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useSocket, useSocketReady } from '../../context/SocketContext';
import { resetRoomMessages, selectSocket } from '../../features/socket/socketSlice';
import useAuth from '../../hooks/use-auth';
import AppbarLayout from '../../layout/AppbarLayout';
import './style.scss';

function GamePage() {
  const { gameID } = useParams();
  const { roomID, roomMembers, roomMessages } = useAppSelector(selectSocket);
  const dispatch = useAppDispatch();
  const socketClient = useSocket();
  const { profile } = useAuth();
  const isReady = useSocketReady();
  const chatInputRef = useRef<any>();
  const containerRef = useRef<any>();

  useLayoutEffect(() => {
    containerRef.current.scrollTop = containerRef.current.scrollHeight;
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
  return (
    <AppbarLayout>
      <div className="game__page--root">
        <div>Game# {gameID}</div>
        Members :
        {roomMembers.map((m) => (
          <div key={m.id}>{m.nickname}</div>
        ))}
        <div className="chats__container">
          <div className="chat__history__container">
            <div className="chat__history__scroll__root" ref={containerRef}>
              {roomMessages.map(({ id, from, message }) => (
                <div key={id} className="chat__history__item">
                  {from} : {message}
                </div>
              ))}
            </div>
          </div>
          <div className="chat__input__container">
            <input type="text" className="chat__input" onKeyUp={handleSubmit} ref={chatInputRef} />
            <button className="chat__send__btn" onClick={sendMessage}>
              전송
            </button>
          </div>
        </div>
      </div>
    </AppbarLayout>
  );
}

export default GamePage;
