import React, { useEffect, useState } from 'react';
import './style.scss';
import SectionTitle from '../../components/SectionTitle';
import useAuth from '../../hooks/use-auth';
import AppbarLayout from '../../layout/AppbarLayout';

export default function Profile() {
  const recentHeader = ['날짜', '모드', '등수', '플레이 타임', '공격 횟수', '받은 횟수'];
  const translations = [
    ['total_game_cnt', '총 게임 수'],
    ['total_play_time', '총 플레이 시간'],
    ['single_player_win', '1vs1 승리 횟수'],
    ['multi_player_win', '일반전 승리 횟수'],
    ['total_attack_cnt', '총 공격 횟수'],
  ];
  const [recentList, setRecentList] = useState<string[][]>([]);
  const [statsticsState, setStatsticsState] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [userState, setUserState] = useState({
    nickname: useAuth().profile.nickname,
    stateMessage: '',
  });

  const drawStatistics = (statsticsState: any) => {
    return (
      <>
        {translations.map(([key, value]) => {
          return (
            <div className="statistics-list__item" key={key}>
              <div>{value}</div>
              <div>:</div>
              <div>{statsticsState[key]}</div>
            </div>
          );
        })}
      </>
    );
  };

  const drawRecent = (recentList: Array<any>) => {
    if (recentList.length === 0) return;
    return (
      <>
        {recentList.map((value) => (
          <div className="recent-list" key={value.date}>
            <div>{value.date.slice(0, 10)}</div>
            <div>{value.mode === 'normal' ? '일반전' : '1 vs 1'}</div>
            <div>{value.ranking}</div>
            <div>{value.play_time}</div>
            <div>{value.attack_cnt}</div>
            <div>{value.attacked_cnt}</div>
          </div>
        ))}
      </>
    );
  };

  const changeTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!e.target) return;
    setUserState({ ...userState, stateMessage: e.target.value });
  };

  const clickEditButton = () => {
    if (!editMode) {
      setEditMode(!editMode);
      return;
    } else {
      fetch('api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...userState }),
      })
        .then(() => {
          setEditMode(!editMode);
        })
        .catch((error) => console.log('error:', error));
    }
  };

  useEffect(() => {
    fetch('api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname: userState.nickname }),
    })
      .then((res) => res.json())
      .then((data) => {
        setStatsticsState({ ...statsticsState, ...data.total[0], ...data.win[0] });
        setUserState({ ...userState, stateMessage: data.state_message });
        setRecentList([...data.recentList]);
      })
      .catch((error) => console.log('error:', error));
    return () => {};
  }, [userState.nickname]);

  return (
    <AppbarLayout>
      <div className="profile__page--root">
        <div className="profile-section">
          <SectionTitle>프로필</SectionTitle>
          <img
            className="profile-section__image"
            src="assets/profile.png"
            alt="이미지 다운로드 실패"
          ></img>
          <span className="profile-section__player">{`[ ${userState.nickname} ]`}</span>
          <textarea
            maxLength={50}
            minLength={1}
            className="profile-section__status"
            disabled={!editMode}
            onChange={changeTextArea}
            value={userState.stateMessage}
          ></textarea>
          <button className="profile-section__button" onClick={clickEditButton}>
            {editMode ? `Save Profile` : `Edit Profile`}
          </button>
        </div>
        <div className="total-section">
          <div className="statistics-section ">
            <div className="absolute_border_bottom statistics-section__header">
              <SectionTitle>통계</SectionTitle>
            </div>
            <div className="statistics-list">{drawStatistics(statsticsState)}</div>
          </div>
          <div className="recent-section">
            <div className="absolute_border_bottom recent-section__header">
              <SectionTitle>최근 기록</SectionTitle>
            </div>
            <div className="recent-list__header">
              {recentHeader.map((value) => (
                <div key={value}>{value}</div>
              ))}
            </div>
            <div className="recent-list__scroll">{drawRecent(recentList)}</div>
          </div>
        </div>
      </div>
    </AppbarLayout>
  );
}
