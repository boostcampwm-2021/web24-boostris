import React, { useEffect, useState } from 'react';
import './style.scss';
import SectionTitle from '../../components/SectionTitle';
import Line from '../../components/Line';
import useAuth from '../../hooks/use-auth';

export default function Profile() {
  const drawStatistics = (statsticsState: any) => {
    const translations = [
      ['total_game_cnt', '총 게임 수'],
      ['total_play_time', '총 플레이 시간'],
      ['single_player_win', '1vs1 승리 횟수'],
      ['multi_player_win', '단체전 승리 횟수'],
      ['total_attack_cnt', '총 공격횟수'],
    ];

    return (
      <>
        {translations.map(([key, value], i) => {
          return (
            <div className="stastics-list__item" key={i}>
              <div>{value}</div>
              <div>:</div>
              <div>{statsticsState[key]}</div>
            </div>
          );
        })}
      </>
    );
  };

  const drawRecent = (recentList: string[][]) => {
    return <>{recentList.map((row, i) => row.map((value, j) => <div key={j}>{value}</div>))}</>;
  };

  const recentHeader = ['날짜', '인원', '등수', '플레이 타임', '공격 횟수', '받은 횟수'];
  const [recentList, setRecentList] = useState<string[][]>([]);
  const [statsticsState, setStatsticsState] = useState({});
  const [editMode, setEditMode] = useState(false);

  const [userState, setUserState] = useState({
    nickname: useAuth().profile.nickname,
    stateMessage: '',
  });

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
    <div className="profile">
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
          value={userState.stateMessage}
        ></textarea>
        <button
          className="profile-section__button"
          onClick={() => {
            setEditMode(!editMode);
          }}
        >
          {editMode ? `Save Profile` : `Edit Profile`}
        </button>
      </div>
      <div className="total-section">
        <div className="stastics-section">
          <div className="stastics-section__header">
            <SectionTitle>통계</SectionTitle>
            <div>X</div>
          </div>
          <Line marginTop="13" marginBottom="18" marginRight="0" marginLeft="0" />
          <div className="stastics-list">{drawStatistics(statsticsState)}</div>
        </div>
        <div className="recent-section">
          <SectionTitle>최근 기록</SectionTitle>
          <Line marginTop="13" marginBottom="18" marginRight="0" marginLeft="0" />
          <div className="recent-list__header">
            {recentHeader.map((value, i) => (
              <div key={i}>{value}</div>
            ))}
          </div>
          <div className="recent-list__scroll">
            {/* <div className="recent-list">{drawRecent(recentList)}</div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
