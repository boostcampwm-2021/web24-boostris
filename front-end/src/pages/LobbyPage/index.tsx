import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import Modal from '../../components/Modal';

import SectionTitle from '../../components/SectionTitle';
import useAuth from '../../hooks/use-auth';
import AppbarLayout from '../../layout/AppbarLayout';
import './style.scss';

function LobbyPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const socketRef = useRef<any>(null);
  const modalRef = useRef<any>();

  const [users, setUsers] = useState([]);

  useEffect(() => {
    socketRef.current = io('/lobby/users', {
      transports: ['websocket'],
      path: '/socket.io',
    });
    socketRef.current.on('connect', () => {
      socketRef.current.emit('set userName', profile.nickname);
    });

    socketRef.current.on('user list update', (list: any) => {
      setUsers(list);
    });
  }, [profile.nickname]);

  const handleClick = () => {
    navigate('/tetris');
  };

  const [currentIdx, setCurrentIdx] = useState(0);
  const [modalToggleIdx, setModalToggleIdx] = useState(0);
  const [modalChecked, setModalChecked] = useState(false);
  const handleCreateRooomOpen = () => {
    modalRef.current.open();
  };

  const handleCreatRoomClose = () => {
    setModalToggleIdx(0);
    setModalChecked(false);
    modalRef.current.close();
  };
  return (
    <AppbarLayout>
      <div className="lobby__page--root">
        <div className="lobby__section lobby__sidebar">
          <SectionTitle>내 정보</SectionTitle>
          <p className="absolute_border_bottom my__nickname">{profile.nickname}</p>
          <div className="absolute_border_bottom filter__container toggle__group">
            {['접속자', '친구목록'].map((btn, idx) => (
              <button
                className={`${currentIdx === idx && 'selected'} toggle__btn`}
                key={btn}
                onClick={() => setCurrentIdx(idx)}
              >
                {btn}
              </button>
            ))}
          </div>
          <div className="user__list__container">
            <div className="user__list__scroll__root">
              {users.map(({ nickname, id }) => (
                <div className="user__list--item" key={id}>
                  <span className="dot"></span>
                  {nickname}
                </div>
              ))}
            </div>
          </div>
          <div className="button__group">
            <button className="lobby__btn lobby__btn--dark" onClick={handleCreateRooomOpen}>
              방 생성
            </button>
            <button className="lobby__btn" onClick={handleClick}>
              빠른 입장
            </button>
          </div>
        </div>
        <div className="section__divider"></div>
        <div className="lobby__section lobby__main">
          <SectionTitle>로비</SectionTitle>
          <div className="lobby__container">
            <div className="room__list__scroll__root">
              <div className="room__container room__type--secret">
                <p className="room__title">플레이어1님의 방</p>
                <p className="room__desc">방 설명 글자가 들어가는 부분입니다.</p>
                <p className="room__desc"> * 인원 : 3 / 4</p>
              </div>
              <div className="room__container">
                <p className="room__title">플레이어1님의 방</p>
                <p className="room__desc">방 설명 글자가 들어가는 부분입니다.</p>
                <p className="room__desc"> - 인원 : 3 / 4 - 비밀방 : O</p>
              </div>

              <div className="empty__item"></div>
            </div>
          </div>
        </div>
        <Modal ref={modalRef} title="방 생성">
          <div className="modal__content__row">
            <div className="modal__label">* 방 이름</div>
            <div className="modal__input--container">
              <input type="text" placeholder="플레이어1님의 방" />
            </div>
          </div>
          <div className="modal__content__row">
            <div className="modal__label">* 모드</div>
            <div className="modal__input--container toggle__btn__container">
              {['1vs1', '단체전'].map((btn, idx) => (
                <button
                  className={`${modalToggleIdx === idx && 'selected'} toggle__btn`}
                  key={btn}
                  onClick={() => setModalToggleIdx(idx)}
                >
                  {btn}
                </button>
              ))}
            </div>
          </div>
          <div className="modal__content__row modal__content__row--horizontal">
            <div className="modal__label">* 비밀방</div>
            <div className="modal__checkbox--container">
              <label className="checkbox__container">
                <input
                  type="checkbox"
                  defaultChecked={modalChecked}
                  onChange={(e) => setModalChecked(e.target.checked)}
                />
                <span className="checkmark"></span>
              </label>
            </div>
          </div>
          <div className="mb--40"></div>
          <div className="modal__action__container">
            [<button onClick={handleCreatRoomClose}>아니오</button>/<button>예</button>]
          </div>
        </Modal>
      </div>
    </AppbarLayout>
  );
}

export default LobbyPage;
