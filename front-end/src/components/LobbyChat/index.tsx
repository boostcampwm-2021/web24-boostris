import React, { useState } from 'react';
import './style.scss';

export default function LobbyChat() {
  const [chatOpen, setChatOpen] = useState(false);
  console.log(chatOpen);
  const openChatting = (e: any) => {
    setChatOpen(!chatOpen);
  };

  return (
    <div className="lobby-chats__container">
      <div className={`lobby-chat__history__container ${chatOpen ? '' : 'hidden'} `}>
        <div className="lobby-chat__history__header" onClick={openChatting}>
          X
        </div>
        <div className="lobby-chat__history__scroll__root fancy__scroll"></div>
      </div>
      <div className="lobby-chat__input__container" onClick={openChatting}>
        <input type="text" className="lobby-chat__input" />
        <button className="lobby-chat__send__btn">전송</button>
      </div>
    </div>
  );
}
