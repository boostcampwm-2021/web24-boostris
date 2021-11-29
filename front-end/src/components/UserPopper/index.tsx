import React, { useEffect, useRef, useState } from 'react';
import { useAppDispatch } from '../../app/hooks';
import Popper from '../../components/Popper';
import { useSocket } from '../../context/SocketContext';
import { makeRequest } from '../../features/friend/friendSlice';
import useAuth from '../../hooks/use-auth';
import Modal from '../Modal';
import './style.scss';
import { useNavigate } from 'react-router-dom';

export default function UserPopper({
  profileState,
}: {
  profileState: {
    x: number | null;
    y: number | null;
    nickname: string | null;
    isAlreadyFriend: boolean;
    socketId: string;
    oauthID: string;
  };
}) {
  const popperRef = useRef<any>();
  const { nickname, id } = useAuth().profile;
  const dispatch = useAppDispatch();
  const { current: socketClient } = useSocket();
  const modalRef = useRef<any>();
  const [stateMessage, setStateMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('api/profile/stateMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname: profileState.nickname }),
    })
      .then((res) => res.json())
      .then((data) => {
        setStateMessage(data.state_message);
      })
      .catch((e) => console.error('에러 발생'));
    return () => {};
  }, [profileState.nickname]);

  const clickMoreProfile = () => {
    navigate(`/profile/${profileState.nickname}`);
  };

  useEffect(() => {
    popperRef.current.setPosition(profileState.x, profileState.y);
    popperRef.current.open();
  }, [profileState]);

  const clickProfile = () => {
    modalRef.current.open();
    popperRef.current.close();
  };

  const handleRequestFriend = () => {
    if (id === profileState.oauthID) {
      alert('나는 이미 나의 친구입니다.💓');
    } else if (id && profileState.oauthID) {
      alert('친구 신청을 보냈습니다.');
      dispatch(
        makeRequest({
          requester: `${id}`,
          requestee: profileState.oauthID,
          cb: () => {
            socketClient.emit('refresh request list', profileState.socketId);
          },
        })
      );
    } else {
      alert('오류발생 다시 시도해주세요');
    }
    popperRef.current.close();
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
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
      <Modal ref={modalRef} title="프로필" type="profile">
        <img
          className="modal--profile__image"
          src="assets/profile.png"
          alt="이미지 다운로드 실패"
        ></img>
        <div className="modal--profile__nickname">{profileState.nickname}</div>
        <textarea className="modal--profile__status" value={stateMessage} disabled></textarea>
        <div className="modal--profile__more" onClick={clickMoreProfile}>{`상세 프로필 >`}</div>
      </Modal>
    </div>
  );
}
