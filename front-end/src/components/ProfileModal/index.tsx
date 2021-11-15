import React from 'react';
import './style.scss';

export default function ProfileModal() {
  return (
    <div className="profile-modal__root">
      <div className="profile-modal__overlay" />
      <div className="profile-modal__content">
        <div className="profile-modal__header">
          <div>{'_'}</div>
          <div className="profile-modal__title">{`[ 프로필 ]`}</div>
          <div className="profile-modal__exit">X</div>
        </div>
        <img
          className="profile-modal__image"
          src="assets/profile.png"
          alt="이미지 다운로드 실패"
        ></img>
        <div className="profile-modal__nickname">{`안녕`}</div>
        <textarea className="profile-modal__status" disabled></textarea>
        <div className="profile-modal__more">{`상세 프로필 >`}</div>
      </div>
    </div>
  );
}
