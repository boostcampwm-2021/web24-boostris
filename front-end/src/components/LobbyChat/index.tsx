import React, { useState, useRef, useLayoutEffect } from 'react';
import { nanoid } from '@reduxjs/toolkit';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useSocket } from '../../context/SocketContext';
import { resetLobbyMessages, selectSocket } from '../../features/socket/socketSlice';

import './style.scss';

export default function LobbyChat({
  nickname,
  socketClient,
}: {
  nickname: any;
  socketClient: any;
}) {
  const chatInputRef = useRef<any>();
  const containerRef = useRef<any>();
  const [chatOpen, setChatOpen] = useState(false);
  const { lobbyMessages } = useAppSelector(selectSocket);

  useLayoutEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  });

  const handleSubmit: React.KeyboardEventHandler = (e) => {
    if (e.key === 'Enter') {
      sendMessage(e);
    }
  };

  const sendMessage = (e: any) => {
    e.stopPropagation();
    if (chatInputRef.current.value.length) {
      socketClient.current.emit('send lobby message', {
        from: nickname,
        message: chatInputRef.current.value,
        id: nanoid(),
      });
      chatInputRef.current.value = '';
    }
  };

  return (
    <div className="lobby-chats__container">
      <div className={`${chatOpen ? 'lobby-chat__history__container' : 'hidden'}`}>
        <div className="lobby-chat__history__header">
          <div>{`> 로비 채팅`}</div>
          <div onClick={() => setChatOpen(false)}>X</div>
        </div>
        <div className="lobby-chat__history__scroll__root fancy__scroll" ref={containerRef}>
          {lobbyMessages.map(({ id, from, message }) => (
            <div key={id} className="chat__history__item">
              {from === 'socket-server' ? message : `${from} : ${message}`}
            </div>
          ))}
        </div>
      </div>
      <div className="lobby-chat__input__container" onClick={() => setChatOpen(true)}>
        <input
          type="text"
          className="lobby-chat__input"
          onKeyUp={handleSubmit}
          ref={chatInputRef}
        />
        <button className="lobby-chat__send__btn" onClick={sendMessage}>
          전송
        </button>
      </div>
    </div>
  );
}
