import React, { useEffect, useState } from 'react';
import './style.scss';
import { useNavigate } from 'react-router-dom';

export default function ProfileModal({
  nickname,
  toggleModal,
}: {
  nickname: string | null;
  toggleModal: () => void;
}) {
  const [stateMessage, setStateMessage] = useState('');
  const navigate = useNavigate();

  const clickMoreProfile = () => {
    navigate(`/profile/${nickname}`);
  };

  useEffect(() => {
    fetch('api/profile/stateMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname }),
    })
      .then((res) => res.json())
      .then((data) => {
        setStateMessage(data.state_message);
      })
      .catch((e) => console.error('에러 발생'));
    return () => {};
  }, [nickname]);

  return (
    <div className="profile-modal__root">
      <div className="profile-modal__overlay" onClick={toggleModal} />
      <div className="profile-modal__content">
        <div className="profile-modal__header">
          <div>{'_'}</div>
          <div className="profile-modal__title">{`[ 프로필 ]`}</div>
          <div className="profile-modal__exit" onClick={toggleModal}>
            X
          </div>
        </div>
        <img
          className="profile-modal__image"
          src="assets/profile.png"
          alt="이미지 다운로드 실패"
        ></img>
        <div className="profile-modal__nickname">{nickname}</div>
        <textarea className="profile-modal__status" value={stateMessage} disabled></textarea>
        <div className="profile-modal__more" onClick={clickMoreProfile}>{`상세 프로필 >`}</div>
      </div>
    </div>
  );
}
