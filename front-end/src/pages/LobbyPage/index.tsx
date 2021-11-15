import { MouseEventHandler, useCallback, useRef, useState, useEffect } from 'react';
import { useVirtual } from 'react-virtual';
// import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import Modal from '../../components/Modal';
import Popper from '../../components/Popper';

import SectionTitle from '../../components/SectionTitle';
import SEO from '../../components/SEO';
import { useSocket, useSocketReady } from '../../context/SocketContext';
import { selectSocket } from '../../features/socket/socketSlice';
import useAuth from '../../hooks/use-auth';
import AppbarLayout from '../../layout/AppbarLayout';
import './style.scss';

type rightClickEventType = MouseEventHandler | ((e: any, id: string) => void);

function LobbyPage() {
  // const navigate = useNavigate();

  const { profile } = useAuth();
  const { rooms, users } = useAppSelector(selectSocket);
  const socketClient = useSocket();

  const modalRef = useRef<any>();
  const notificationModalRef = useRef<any>();
  const popperRef = useRef<any>();
  const userListContainerRef = useRef<any>();
  const roomNameInputRef = useRef<any>();
  const parentRef = useRef<any>();

  const [activatedUser, setActivatedUser] = useState<string>('');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [modalToggleIdx, setModalToggleIdx] = useState(0);
  const [modalChecked, setModalChecked] = useState(false);

  const rowVirtualizer = useVirtual({
    size: users.length,
    // size: 100 * 1000,
    parentRef,
    estimateSize: useCallback(() => 35, []),
    overscan: 5,
  });

  const handleFastJoinClick = () => {
    // navigate('/tetris');
    const availableRooms = rooms.filter((r) => r.current < r.limit);
    if (availableRooms.length) {
      const [target] = availableRooms;
      joinRoom(target.id);
    } else {
      alert('🔥🔥 유효한 방이 현재는 없습니다. 방 생성 > 입장을 통해 입장해주세요 🔥🔥');
    }
  };
  const handleCreateRooomOpen = () => {
    modalRef.current.open();
  };
  const handleCreatRoomClose = () => {
    setModalToggleIdx(0);
    setModalChecked(false);
    modalRef.current.close();
  };

  const handleNotificationModal = () => {
    notificationModalRef.current.open();
  };

  const handleCreatRoomSubmit = () => {
    socketClient.current.emit('create room', {
      owner: profile.nickname,
      name: roomNameInputRef.current.value,
      limit: modalToggleIdx + 2,
      isSecret: modalChecked,
      nickname: profile.nickname,
    });
  };

  const rightClickListener: rightClickEventType = (e, id) => {
    e.preventDefault();
    const { target } = e;
    if ((target as HTMLElement).closest('.user__list--item')) {
      popperRef.current.setPosition(e.clientX, e.clientY);
      popperRef.current.setUserNickname(target.innerText);
      popperRef.current.open();
    }
    setActivatedUser(id);
  };

  const resetActivatedPopper = () => {
    const targetRef = popperRef.current;
    targetRef.close();
    setActivatedUser('');
  };

  const joinRoom = (id: string) => {
    socketClient.current.emit('join room', id, profile.nickname);
  };

  return (
    <AppbarLayout>
      <SEO>
        <title>로비</title>
      </SEO>
      <div className="lobby__page--root" onClick={resetActivatedPopper}>
        <div className="lobby__section lobby__sidebar">
          <SectionTitle>내 정보</SectionTitle>
          <div className="absolute_border_bottom my__nickname">
            <p>{profile.nickname}</p>
            <button className="notification__btn" onClick={handleNotificationModal}>
              친구알림
            </button>
          </div>
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
          <div ref={userListContainerRef} className="user__list__container">
            <div className="user__list__scroll__root fancy__scroll" ref={parentRef}>
              <div
                style={{
                  height: `${rowVirtualizer.totalSize}px`,
                  width: '100%',
                  position: 'relative',
                }}
              >
                {rowVirtualizer.virtualItems.map((virtualRow: any) => {
                  const { nickname, id } = users[virtualRow.index];
                  return (
                    <div
                      key={id}
                      // key={virtualRow.index}
                      className={`user__list--item ${activatedUser === id && 'activated'}`}
                      onContextMenu={(e) => rightClickListener(e, id)}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      <span className="dot"></span>
                      <span className="name__span">{nickname}</span>
                      {/* <span className="name__span">Row {virtualRow.index}</span> */}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="button__group">
            <button className="lobby__btn lobby__btn--dark" onClick={handleCreateRooomOpen}>
              방 생성
            </button>
            <button className="lobby__btn" onClick={handleFastJoinClick}>
              빠른 입장
            </button>
          </div>
        </div>
        <div className="section__divider"></div>
        <div className="lobby__section lobby__main">
          <SectionTitle>로비</SectionTitle>
          <div className="lobby__container">
            <div className="room__list__scroll__root fancy__scroll">
              {rooms.map(({ id, owner, name, limit, isSecret, current }) => (
                <div
                  key={id}
                  className={`room__container ${isSecret ? 'room__type--secret' : ''}`}
                  onClick={() => {
                    if (limit > current) {
                      joinRoom(id);
                    } else {
                      alert('정원 초과');
                    }
                  }}
                >
                  <p className="room__title">{name}</p>
                  <p className="room__desc">{owner}</p>
                  <p className="room__desc">
                    {' '}
                    * 인원 : {current} / {limit}
                  </p>
                </div>
              ))}

              <div className="empty__item"></div>
            </div>
          </div>
        </div>
        <Modal ref={modalRef} title="방 생성" type="default">
          <div className="modal__content__row">
            <div className="modal__label">* 방 이름</div>
            <div className="modal__input--container">
              <input type="text" placeholder="플레이어1님의 방" ref={roomNameInputRef} />
            </div>
          </div>
          <div className="modal__content__row">
            <div className="modal__label">* 최대인원</div>
            <div className="modal__input--container toggle__btn__container">
              {['2인', '3인', '4인'].map((btn, idx) => (
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
            [<button onClick={handleCreatRoomClose}>아니오</button>/
            <button onClick={handleCreatRoomSubmit}>예</button>]
          </div>
        </Modal>
        <Popper ref={popperRef}>
          <div className="popper__item">프로필</div>
          <div className="popper__item">친구 추가</div>
        </Popper>
        <Modal ref={notificationModalRef} title="알림센터" type="notification">
          <div className="notification__title absolute_border_bottom">&gt; 알림 센터</div>
          <div className="notification__list__container fancy__scroll">
            <div className="notification__list__item absolute_border_bottom">
              <div className="notification__content">황정빈님의 친구 요청입니다.</div>
              <div className="bottom__container">
                <div className="date__container">2021.10.22</div>
                <div className="action__btn__container">
                  [<button>O</button>,<button>X</button>]
                </div>
              </div>
            </div>
            <div className="notification__list__item absolute_border_bottom">
              <div className="notification__content">황정빈님의 친구 요청입니다.</div>
              <div className="bottom__container">
                <div className="date__container">2021.10.22</div>
                <div className="action__btn__container">
                  [<button>O</button>,<button>X</button>]
                </div>
              </div>
            </div>
            <div className="notification__list__item absolute_border_bottom">
              <div className="notification__content">황정빈님의 친구 요청입니다.</div>
              <div className="bottom__container">
                <div className="date__container">2021.10.22</div>
                <div className="action__btn__container">
                  [<button>O</button>,<button>X</button>]
                </div>
              </div>
            </div>
            <div className="notification__list__item absolute_border_bottom">
              <div className="notification__content">황정빈님의 친구 요청입니다.</div>
              <div className="bottom__container">
                <div className="date__container">2021.10.22</div>
                <div className="action__btn__container">
                  [<button>O</button>,<button>X</button>]
                </div>
              </div>
            </div>
            <div className="notification__list__item absolute_border_bottom">
              <div className="notification__content">황정빈님의 친구 요청입니다.</div>
              <div className="bottom__container">
                <div className="date__container">2021.10.22</div>
                <div className="action__btn__container">
                  [<button>O</button>,<button>X</button>]
                </div>
              </div>
            </div>
            <div className="notification__list__item absolute_border_bottom">
              <div className="notification__content">황정빈님의 친구 요청입니다.</div>
              <div className="bottom__container">
                <div className="date__container">2021.10.22</div>
                <div className="action__btn__container">
                  [<button>O</button>,<button>X</button>]
                </div>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </AppbarLayout>
  );
}

export default LobbyPage;
