import { MouseEventHandler, useCallback, useRef, useState, useEffect } from 'react';
import { useVirtual } from 'react-virtual';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import Modal from '../../components/Modal';

import SectionTitle from '../../components/SectionTitle';
import SEO from '../../components/SEO';
import { useSocket, useSocketReady } from '../../context/SocketContext';
import UserPopper from '../../components/UserPopper';
import { selectSocket } from '../../features/socket/socketSlice';
import useAuth from '../../hooks/use-auth';
import AppbarLayout from '../../layout/AppbarLayout';
import './style.scss';
import LobbyChat from '../../components/LobbyChat';
import {
  getFriendList,
  getRequestList,
  selectFriend,
  updateRequest,
} from '../../features/friend/friendSlice';

type rightClickEventType = MouseEventHandler | ((e: any, id: string, oauthID: string) => void);

function LobbyPage() {
  const { profile } = useAuth();
  const { rooms, users } = useAppSelector(selectSocket);
  const { friendList, friendRequestList } = useAppSelector(selectFriend);
  const socketClient = useSocket();
  const { isReady } = useSocketReady();
  const dispatch = useAppDispatch();

  const modalRef = useRef<any>();
  const notificationModalRef = useRef<any>();
  const userListContainerRef = useRef<any>();
  const roomNameInputRef = useRef<any>();
  const parentRef = useRef<any>();

  const [activatedUser, setActivatedUser] = useState<string>('');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [modalToggleIdx, setModalToggleIdx] = useState(0);
  const [modalChecked, setModalChecked] = useState(false);
  const [profileState, setProfileState] = useState<{
    x: number | null;
    y: number | null;
    nickname: string | null;
    isAlreadyFriend: boolean;
    socketId: string;
    oauthID: string;
  }>({ x: null, y: null, nickname: null, isAlreadyFriend: false, socketId: '', oauthID: '' });

  useEffect(() => {
    if (profile.id) {
      dispatch(
        getFriendList({
          oauthID: `${profile.id}`,
        })
      );
      dispatch(
        getRequestList({
          requestee: `${profile.id}`,
        })
      );
    }
  }, [dispatch, profile.id]);

  const userListVirtualizer = useVirtual({
    size: users.length,
    // size: 100 * 1000,
    parentRef,
    estimateSize: useCallback(() => 35, []),
    overscan: 5,
  });
  const friendListVirtualizer = useVirtual({
    size: friendList.length,
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

  const rightClickListener: rightClickEventType = (e, id, oauthID) => {
    e.preventDefault();
    const { target } = e;
    if ((target as HTMLElement).closest('.user__list--item')) {
      setProfileState({
        x: e.clientX,
        y: e.clientY,
        nickname: target.innerText,
        isAlreadyFriend: friendList.findIndex((f: any) => f === target.innerText) !== -1,
        socketId: id,
        oauthID,
      });
    }
    setActivatedUser(id);
  };

  const resetActivatedUser = () => {
    setProfileState({
      ...profileState,
      x: null,
      y: null,
      nickname: null,
      isAlreadyFriend: false,
      socketId: '',
    });
    setActivatedUser('');
  };

  const joinRoom = (id: string) => {
    socketClient.current.emit('join room', id, profile.nickname);
  };

  const handleUpdateRequest = (result: boolean, oauth_id: string) => {
    dispatch(
      updateRequest({
        isAccept: result ? 1 : 0,
        requestee: profile.id as string,
        requester: oauth_id,
        cb: () => {
          notificationModalRef.current.close();
          dispatch(
            getRequestList({
              requestee: profile.id as string,
            })
          );
          dispatch(
            getFriendList({
              oauthID: profile.id as string,
            })
          );

          if (result) {
            socketClient.current.emit('refresh friend list', oauth_id);
          }
        },
      })
    );
  };

  useEffect(() => {
    if(!isReady) return;

    const popstateEvent = (e: any) => {
      const url = e.target.location.pathname;

      if(url.includes('/game/')) {
        const gameID = url.split('/game/')[1];
        socketClient.current.emit('check valid room', { roomID: gameID, id: socketClient.id });
      }
    }

    window.addEventListener('popstate', popstateEvent);

    return () => {
      window.removeEventListener('popstate', popstateEvent);
    }
  }, [isReady]);

  return (
    <AppbarLayout>
      <SEO>
        <title>로비</title>
      </SEO>
      <div className="lobby__page--root" onClick={resetActivatedUser}>
        <div className="lobby__section lobby__sidebar">
          <SectionTitle>내 정보</SectionTitle>
          <div className="absolute_border_bottom my__nickname">
            <p>{profile.nickname}</p>
            <div className="notification__container">
              <button className="notification__btn" onClick={handleNotificationModal}>
                알림센터
              </button>
              <div className={`notification__badge ${friendRequestList.length > 0 ? 'on' : ''}`}>
                {friendRequestList.length > 99 ? '99+' : friendRequestList.length}
              </div>
            </div>
          </div>
          <div className="absolute_border_bottom filter__container toggle__group">
            {['접속자', '친구목록'].map((btn, idx) => (
              <button
                className={`${currentIdx === idx && 'selected'} toggle__btn`}
                key={btn}
                onClick={async () => {
                  setCurrentIdx(idx);
                  await dispatch(
                    getFriendList({
                      oauthID: `${profile.id}`,
                    })
                  );
                }}
              >
                {btn}
              </button>
            ))}
          </div>
          <div ref={userListContainerRef} className="user__list__container">
            <div className="user__list__scroll__root fancy__scroll" ref={parentRef}>
              {currentIdx === 0 ? (
                <div
                  style={{
                    height: `${userListVirtualizer.totalSize}px`,
                    width: '100%',
                    position: 'relative',
                  }}
                >
                  {userListVirtualizer.virtualItems.map((virtualRow: any) => {
                    const { nickname, id, oauthID } = users[virtualRow.index];
                    return (
                      <div
                        key={id}
                        className={`user__list--item ${activatedUser === id && 'activated'}`}
                        onContextMenu={(e) => rightClickListener(e, id, oauthID)}
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
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div
                  style={{
                    height: `${friendListVirtualizer.totalSize}px`,
                    width: '100%',
                    position: 'relative',
                  }}
                >
                  {friendListVirtualizer.virtualItems.map((virtualRow: any) => {
                    const nickname = friendList[virtualRow.index];
                    return (
                      <div
                        key={nickname}
                        className={`user__list--item ${activatedUser === nickname && 'activated'}`}
                        onContextMenu={(e) => rightClickListener(e, nickname, '')}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: `${virtualRow.size}px`,
                          transform: `translateY(${virtualRow.start}px)`,
                        }}
                      >
                        <span
                          className={`dot ${
                            users.findIndex((u) => u.nickname === nickname) !== -1 ? '' : 'offline'
                          }`}
                        ></span>
                        <span className="name__span">{nickname}</span>
                      </div>
                    );
                  })}
                </div>
              )}
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
        <div className="lobby__main__container">
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
          <LobbyChat nickname={profile.nickname} socketClient={socketClient} />
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
        <Modal ref={notificationModalRef} title="알림센터" type="notification">
          <div className="notification__title absolute_border_bottom">&gt; 알림 센터</div>
          <div className="notification__list__container fancy__scroll">
            {friendRequestList.map(
              ({
                nickname,
                created_at,
                oauth_id,
              }: {
                nickname: string;
                created_at: string;
                oauth_id: string;
              }) => (
                <div className="notification__list__item absolute_border_bottom" key={created_at}>
                  <div className="notification__content">{nickname}님의 친구 요청입니다.</div>
                  <div className="bottom__container">
                    <div className="date__container">
                      {new Date(created_at).toLocaleDateString('ko-KR')}
                    </div>
                    <div className="action__btn__container">
                      [<button onClick={() => handleUpdateRequest(true, oauth_id)}>O</button>,
                      <button onClick={() => handleUpdateRequest(false, oauth_id)}>X</button>]
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </Modal>
        {activatedUser !== '' && <UserPopper profileState={profileState} />}
      </div>
    </AppbarLayout>
  );
}

export default LobbyPage;
