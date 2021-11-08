import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SectionTitle from '../../components/SectionTitle';
import AppbarLayout from '../../layout/AppbarLayout';
import './style.scss';

function LobbyPage() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/tetris');
  };

  const [currentIdx, setCurrentIdx] = useState(0);

  return (
    <AppbarLayout>
      <div className="lobby__page--root">
        <div className="lobby__section lobby__sidebar">
          <SectionTitle>내 정보</SectionTitle>
          <p className="absolute_border_bottom my__nickname">플레이어 아이디</p>
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
              <div className="user__list--item">
                <span className="dot"></span>플레이어 아이디
              </div>
              <div className="user__list--item">
                <span className="dot"></span>플레이어 아이디
              </div>
              <div className="user__list--item">
                <span className="dot"></span>플레이어 아이디
              </div>
              <div className="user__list--item">
                <span className="dot"></span>플레이어 아이디
              </div>
              <div className="user__list--item">
                <span className="dot"></span>플레이어 아이디
              </div>
              <div className="user__list--item">
                <span className="dot"></span>플레이어 아이디
              </div>
              <div className="user__list--item">
                <span className="dot"></span>플레이어 아이디
              </div>
              <div className="user__list--item">
                <span className="dot"></span>플레이어 아이디
              </div>
              <div className="user__list--item">
                <span className="dot"></span>플레이어 아이디
              </div>
              <div className="user__list--item">
                <span className="dot"></span>플레이어 아이디
              </div>
              <div className="user__list--item">
                <span className="dot"></span>플레이어 아이디
              </div>
              <div className="user__list--item">
                <span className="dot"></span>플레이어 아이디
              </div>
              <div className="user__list--item">
                <span className="dot"></span>플레이어 아이디
              </div>
              <div className="user__list--item">
                <span className="dot"></span>플레이어 아이디
              </div>
              <div className="user__list--item">
                <span className="dot"></span>플레이어 아이디
              </div>
              <div className="user__list--item">
                <span className="dot"></span>플레이어 아이디
              </div>
              <div className="user__list--item">
                <span className="dot"></span>플레이어 아이디
              </div>
              <div className="user__list--item">
                <span className="dot"></span>플레이어 아이디
              </div>
              <div className="user__list--item">
                <span className="dot"></span>플레이어 아이디
              </div>
              <div className="user__list--item">
                <span className="dot"></span>플레이어 아이디
              </div>
              <div className="user__list--item">
                <span className="dot"></span>플레이어 아이디
              </div>
              <div className="user__list--item">
                <span className="dot"></span>플레이어 아이디
              </div>
              <div className="user__list--item">
                <span className="dot"></span>플레이어 아이디
              </div>
              <div className="user__list--item">
                <span className="dot"></span>플레이어 아이디
              </div>
              <div className="user__list--item">
                <span className="dot"></span>플레이어 아이디
              </div>
              <div className="user__list--item">
                <span className="dot"></span>플레이어 아이디
              </div>
              <div className="user__list--item">
                <span className="dot"></span>플레이어 아이디
              </div>
              <div className="user__list--item">
                <span className="dot"></span>플레이어 아이디
              </div>
              <div className="user__list--item">
                <span className="dot"></span>플레이어 아이디
              </div>
              <div className="user__list--item">
                <span className="dot"></span>플레이어 아이디
              </div>
              <div className="user__list--item">
                <span className="dot"></span>플레이어 아이디
              </div>
              <div className="user__list--item">
                <span className="dot"></span>플레이어 아이디
              </div>
              <div className="user__list--item">
                <span className="dot"></span>플레이어 아이디
              </div>
              <div className="user__list--item">
                <span className="dot"></span>플레이어 아이디
              </div>
              <div className="user__list--item">
                <span className="dot"></span>플레이어 아이디
              </div>
              <div className="user__list--item">
                <span className="dot"></span>플레이어 아이디
              </div>
              <div className="user__list--item">
                <span className="dot"></span>플레이어 아이디
              </div>
              <div className="user__list--item">
                <span className="dot"></span>플레이어 아이디
              </div>
              <div className="user__list--item">
                <span className="dot"></span>플레이어 아이디
              </div>
              <div className="user__list--item">
                <span className="dot"></span>플레이어 아이디
              </div>
              <div className="user__list--item">
                <span className="dot"></span>플레이어 아이디
              </div>
              <div className="user__list--item">
                <span className="dot"></span>플레이어 아이디
              </div>
              <div className="user__list--item">
                <span className="dot"></span>플레이어 아이디
              </div>
              <div className="user__list--item">
                <span className="dot"></span>플레이어 아이디
              </div>
              <div className="user__list--item">
                <span className="dot"></span>플레이어 아이디
              </div>
              <div className="user__list--item">
                <span className="dot"></span>플레이어 아이디
              </div>
              <div className="user__list--item">
                <span className="dot"></span>플레이어 아이디
              </div>
              <div className="user__list--item">
                <span className="dot"></span>플레이어 아이디
              </div>
              <div className="user__list--item">
                <span className="dot"></span>플레이어 아이디
              </div>
              <div className="user__list--item">
                <span className="dot"></span>플레이어 아이디
              </div>
              <div className="user__list--item">
                <span className="dot"></span>플레이어 아이디
              </div>
              <div className="user__list--item">
                <span className="dot"></span>플레이어 아이디
              </div>
              <div className="user__list--item">
                <span className="dot"></span>플레이어 아이디
              </div>
              <div className="user__list--item">
                <span className="dot"></span>플레이어 아이디
              </div>
              <div className="user__list--item">
                <span className="dot"></span>플레이어 아이디
              </div>
              <div className="user__list--item">
                <span className="dot"></span>플레이어 아이디
              </div>
              <div className="user__list--item">
                <span className="dot"></span>플레이어 아이디
              </div>
              <div className="user__list--item">
                <span className="dot"></span>플레이어 아이디
              </div>
            </div>
          </div>
          <div className="button__group">
            <button className="lobby__btn lobby__btn--dark">방 생성</button>
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
              <div className="room__container">
                <p className="room__title">플레이어1님의 방</p>
                <p className="room__desc">방 설명 글자가 들어가는 부분입니다.</p>
                <p className="room__desc"> - 인원 : 3 / 4 - 비밀방 : O</p>
              </div>
              <div className="room__container">
                <p className="room__title">플레이어1님의 방</p>
                <p className="room__desc">방 설명 글자가 들어가는 부분입니다.</p>
                <p className="room__desc"> - 인원 : 3 / 4 - 비밀방 : O</p>
              </div>
              <div className="room__container">
                <p className="room__title">플레이어1님의 방</p>
                <p className="room__desc">방 설명 글자가 들어가는 부분입니다.</p>
                <p className="room__desc"> - 인원 : 3 / 4 - 비밀방 : O</p>
              </div>
              <div className="room__container">
                <p className="room__title">플레이어1님의 방</p>
                <p className="room__desc">방 설명 글자가 들어가는 부분입니다.</p>
                <p className="room__desc"> - 인원 : 3 / 4 - 비밀방 : O</p>
              </div>
              <div className="room__container">
                <p className="room__title">플레이어1님의 방</p>
                <p className="room__desc">방 설명 글자가 들어가는 부분입니다.</p>
                <p className="room__desc"> - 인원 : 3 / 4 - 비밀방 : O</p>
              </div>
              <div className="room__container">
                <p className="room__title">플레이어1님의 방</p>
                <p className="room__desc">방 설명 글자가 들어가는 부분입니다.</p>
                <p className="room__desc"> - 인원 : 3 / 4 - 비밀방 : O</p>
              </div>
              <div className="room__container">
                <p className="room__title">플레이어1님의 방</p>
                <p className="room__desc">방 설명 글자가 들어가는 부분입니다.</p>
                <p className="room__desc"> - 인원 : 3 / 4 - 비밀방 : O</p>
              </div>
              <div className="room__container">
                <p className="room__title">플레이어1님의 방</p>
                <p className="room__desc">방 설명 글자가 들어가는 부분입니다.</p>
                <p className="room__desc"> - 인원 : 3 / 4 - 비밀방 : O</p>
              </div>
              <div className="room__container">
                <p className="room__title">플레이어1님의 방</p>
                <p className="room__desc">방 설명 글자가 들어가는 부분입니다.</p>
                <p className="room__desc"> - 인원 : 3 / 4 - 비밀방 : O</p>
              </div>
              <div className="room__container">
                <p className="room__title">플레이어1님의 방</p>
                <p className="room__desc">방 설명 글자가 들어가는 부분입니다.</p>
                <p className="room__desc"> - 인원 : 3 / 4 - 비밀방 : O</p>
              </div>
              <div className="room__container">
                <p className="room__title">플레이어1님의 방</p>
                <p className="room__desc">방 설명 글자가 들어가는 부분입니다.</p>
                <p className="room__desc"> - 인원 : 3 / 4 - 비밀방 : O</p>
              </div>
              <div className="room__container">
                <p className="room__title">플레이어1님의 방</p>
                <p className="room__desc">방 설명 글자가 들어가는 부분입니다.</p>
                <p className="room__desc"> - 인원 : 3 / 4 - 비밀방 : O</p>
              </div>
              <div className="room__container">
                <p className="room__title">플레이어1님의 방</p>
                <p className="room__desc">방 설명 글자가 들어가는 부분입니다.</p>
                <p className="room__desc"> - 인원 : 3 / 4 - 비밀방 : O</p>
              </div>
              <div className="room__container">
                <p className="room__title">플레이어1님의 방</p>
                <p className="room__desc">방 설명 글자가 들어가는 부분입니다.</p>
                <p className="room__desc"> - 인원 : 3 / 4 - 비밀방 : O</p>
              </div>
              <div className="room__container">
                <p className="room__title">플레이어1님의 방</p>
                <p className="room__desc">방 설명 글자가 들어가는 부분입니다.</p>
                <p className="room__desc"> - 인원 : 3 / 4 - 비밀방 : O</p>
              </div>
              <div className="room__container">
                <p className="room__title">플레이어1님의 방</p>
                <p className="room__desc">방 설명 글자가 들어가는 부분입니다.</p>
                <p className="room__desc"> - 인원 : 3 / 4 - 비밀방 : O</p>
              </div>
              <div className="room__container">
                <p className="room__title">플레이어1님의 방</p>
                <p className="room__desc">방 설명 글자가 들어가는 부분입니다.</p>
                <p className="room__desc"> - 인원 : 3 / 4 - 비밀방 : O</p>
              </div>
              <div className="room__container">
                <p className="room__title">플레이어1님의 방</p>
                <p className="room__desc">방 설명 글자가 들어가는 부분입니다.</p>
                <p className="room__desc"> - 인원 : 3 / 4 - 비밀방 : O</p>
              </div>
              <div className="room__container">
                <p className="room__title">플레이어1님의 방</p>
                <p className="room__desc">방 설명 글자가 들어가는 부분입니다.</p>
                <p className="room__desc"> - 인원 : 3 / 4 - 비밀방 : O</p>
              </div>
              <div className="room__container">
                <p className="room__title">플레이어1님의 방</p>
                <p className="room__desc">방 설명 글자가 들어가는 부분입니다.</p>
                <p className="room__desc"> - 인원 : 3 / 4 - 비밀방 : O</p>
              </div>
              <div className="room__container">
                <p className="room__title">플레이어1님의 방</p>
                <p className="room__desc">방 설명 글자가 들어가는 부분입니다.</p>
                <p className="room__desc"> - 인원 : 3 / 4 - 비밀방 : O</p>
              </div>
              <div className="room__container">
                <p className="room__title">플레이어1님의 방</p>
                <p className="room__desc">방 설명 글자가 들어가는 부분입니다.</p>
                <p className="room__desc"> - 인원 : 3 / 4 - 비밀방 : O</p>
              </div>
              <div className="room__container">
                <p className="room__title">플레이어1님의 방</p>
                <p className="room__desc">방 설명 글자가 들어가는 부분입니다.</p>
                <p className="room__desc"> - 인원 : 3 / 4 - 비밀방 : O</p>
              </div>
              <div className="room__container">
                <p className="room__title">플레이어1님의 방</p>
                <p className="room__desc">방 설명 글자가 들어가는 부분입니다.</p>
                <p className="room__desc"> - 인원 : 3 / 4 - 비밀방 : O</p>
              </div>
              <div className="room__container">
                <p className="room__title">플레이어1님의 방</p>
                <p className="room__desc">방 설명 글자가 들어가는 부분입니다.</p>
                <p className="room__desc"> - 인원 : 3 / 4 - 비밀방 : O</p>
              </div>
              <div className="room__container">
                <p className="room__title">플레이어1님의 방</p>
                <p className="room__desc">방 설명 글자가 들어가는 부분입니다.</p>
                <p className="room__desc"> - 인원 : 3 / 4 - 비밀방 : O</p>
              </div>
              <div className="room__container">
                <p className="room__title">플레이어1님의 방</p>
                <p className="room__desc">방 설명 글자가 들어가는 부분입니다.</p>
                <p className="room__desc"> - 인원 : 3 / 4 - 비밀방 : O</p>
              </div>
              <div className="room__container">
                <p className="room__title">플레이어1님의 방</p>
                <p className="room__desc">방 설명 글자가 들어가는 부분입니다.</p>
                <p className="room__desc"> - 인원 : 3 / 4 - 비밀방 : O</p>
              </div>
              <div className="room__container">
                <p className="room__title">플레이어1님의 방</p>
                <p className="room__desc">방 설명 글자가 들어가는 부분입니다.</p>
                <p className="room__desc"> - 인원 : 3 / 4 - 비밀방 : O</p>
              </div>
              <div className="room__container">
                <p className="room__title">플레이어1님의 방</p>
                <p className="room__desc">방 설명 글자가 들어가는 부분입니다.</p>
                <p className="room__desc"> - 인원 : 3 / 4 - 비밀방 : O</p>
              </div>
              <div className="room__container">
                <p className="room__title">플레이어1님의 방</p>
                <p className="room__desc">방 설명 글자가 들어가는 부분입니다.</p>
                <p className="room__desc"> - 인원 : 3 / 4 - 비밀방 : O</p>
              </div>
              <div className="room__container">
                <p className="room__title">플레이어1님의 방</p>
                <p className="room__desc">방 설명 글자가 들어가는 부분입니다.</p>
                <p className="room__desc"> - 인원 : 3 / 4 - 비밀방 : O</p>
              </div>
              <div className="room__container">
                <p className="room__title">플레이어1님의 방</p>
                <p className="room__desc">방 설명 글자가 들어가는 부분입니다.</p>
                <p className="room__desc"> - 인원 : 3 / 4 - 비밀방 : O</p>
              </div>
              <div className="room__container">
                <p className="room__title">플레이어1님의 방</p>
                <p className="room__desc">방 설명 글자가 들어가는 부분입니다.</p>
                <p className="room__desc"> - 인원 : 3 / 4 - 비밀방 : O</p>
              </div>
              <div className="room__container">
                <p className="room__title">플레이어1님의 방</p>
                <p className="room__desc">방 설명 글자가 들어가는 부분입니다.</p>
                <p className="room__desc"> - 인원 : 3 / 4 - 비밀방 : O</p>
              </div>
              <div className="room__container">
                <p className="room__title">플레이어1님의 방</p>
                <p className="room__desc">방 설명 글자가 들어가는 부분입니다.</p>
                <p className="room__desc"> - 인원 : 3 / 4 - 비밀방 : O</p>
              </div>
              <div className="room__container">
                <p className="room__title">플레이어1님의 방</p>
                <p className="room__desc">방 설명 글자가 들어가는 부분입니다.</p>
                <p className="room__desc"> - 인원 : 3 / 4 - 비밀방 : O</p>
              </div>
              <div className="room__container">
                <p className="room__title">플레이어1님의 방</p>
                <p className="room__desc">방 설명 글자가 들어가는 부분입니다.</p>
                <p className="room__desc"> - 인원 : 3 / 4 - 비밀방 : O</p>
              </div>
              <div className="room__container">
                <p className="room__title">플레이어1님의 방</p>
                <p className="room__desc">방 설명 글자가 들어가는 부분입니다.</p>
                <p className="room__desc"> - 인원 : 3 / 4 - 비밀방 : O</p>
              </div>
              <div className="room__container">
                <p className="room__title">플레이어1님의 방</p>
                <p className="room__desc">방 설명 글자가 들어가는 부분입니다.</p>
                <p className="room__desc"> - 인원 : 3 / 4 - 비밀방 : O</p>
              </div>
              <div className="room__container">
                <p className="room__title">플레이어1님의 방</p>
                <p className="room__desc">방 설명 글자가 들어가는 부분입니다.</p>
                <p className="room__desc"> - 인원 : 3 / 4 - 비밀방 : O</p>
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
        {/*<div>{state.user ? JSON.stringify(state.user.login) : state.name}</div>*/}
      </div>
    </AppbarLayout>
  );
}

export default LobbyPage;
