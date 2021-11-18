import React, { useEffect, useRef, useState } from 'react';
import { useAppDispatch } from '../../app/hooks';
import Popper from '../../components/Popper';
import { useSocket } from '../../context/SocketContext';
import { makeRequest } from '../../features/friend/friendSlice';
import useAuth from '../../hooks/use-auth';
import ProfileModal from '../ProfileModal';
import './style.scss';

export default function UserPopper({
  resetActivatedUser,
  profileState,
}: {
  resetActivatedUser: () => void;
  profileState: {
    x: number | null;
    y: number | null;
    nickname: string | null;
    isAlreadyFriend: boolean;
    socketId: string;
  };
}) {
  const popperRef = useRef<any>();
  const [modal, setModal] = useState(false);
  const { nickname } = useAuth().profile;
  const dispatch = useAppDispatch();
  const { current: socketClient } = useSocket();

  const toggleModal = () => {
    if (modal) resetActivatedUser();
    setModal(!modal);
  };

  useEffect(() => {
    popperRef.current.setPosition(profileState.x, profileState.y);
    popperRef.current.open();
  }, [profileState]);

  const resetActivatedPopper = () => {
    popperRef.current.close();
    resetActivatedUser();
  };

  const clickProfile = () => {
    popperRef.current.close();
    toggleModal();
  };

  const handleRequestFriend = () => {
    if (nickname === profileState.nickname) {
      alert('나는 이미 나의 친구입니다.💓');
    } else if (nickname && profileState.nickname) {
      dispatch(
        makeRequest({
          requester: nickname,
          requestee: profileState.nickname,
        })
      );
      socketClient.emit('refresh request list', profileState.socketId);
    } else {
      alert('오류발생 다시 시도해주세요');
    }
  };

  return (
    <>
      <div className="popper__overlay" onClick={resetActivatedPopper}>
        <Popper ref={popperRef}>
          <div className="popper__item" onClick={clickProfile}>
            프로필
          </div>
          {!profileState.isAlreadyFriend && (
            <div className="popper__item" onClick={handleRequestFriend}>
              친구 추가
            </div>
          )}
        </Popper>
      </div>
      {modal && <ProfileModal nickname={profileState.nickname} toggleModal={toggleModal} />}
    </>
  );
}
