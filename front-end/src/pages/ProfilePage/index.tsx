import React, { useEffect, useState } from 'react';
import './style.scss';
import SectionTitle from '../../components/SectionTitle';
import Line from '../../components/Line';
import useAuth from '../../hooks/use-auth';

export default function Profile() {
  const drawStastics = (statsticsList: string[][]) => {
    return (
      <>
        {statsticsList.map(([key, value], i) => {
          return (
            <div className="stastics-list__item" key={i}>
              <div>{key}</div>
              <div>:</div>
              <div>{value}</div>
            </div>
          );
        })}
      </>
    );
  };

  // const recentList = [
  //   ['2021-10-22', '4명', '1등', '2:23:10', '21', '22'],
  //   ['2021-10-22', '4명', '1등', '2:23:10', '21', '22'],
  //   ['2021-10-22', '4명', '1등', '2:23:10', '21', '22'],
  //   ['2021-10-22', '4명', '1등', '2:23:10', '21', '22'],
  //   ['2021-10-22', '4명', '1등', '2:23:10', '21', '22'],
  //   ['2021-10-22', '4명', '1등', '2:23:10', '21', '22'],
  //   ['2021-10-22', '4명', '1등', '2:23:10', '21', '22'],
  //   ['2021-10-22', '4명', '1등', '2:23:10', '21', '22'],
  // ];

  const drawRecent = (recentList: string[][]) => {
    return <>{recentList.map((row, i) => row.map((value, j) => <div key={j}>{value}</div>))}</>;
  };

  const recentHeader = ['날짜', '인원', '등수', '플레이 타임', '공격 횟수', '받은 횟수'];
  const [recentList, setRecentList] = useState<string[][]>([]);
  const [stateMessage, setStateMessage] = useState<string>('');
  const [statsticsList, setStatsticsList] = useState<string[][]>([]);
  const [editMode, setEditMode] = useState(false);
  const [nickname, setNickname] = useState<string | null>(useAuth().profile.nickname);

  useEffect(() => {
    console.log(nickname);
    fetch('api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname: nickname }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        const statsticsDatas = [
          ['게임 수', data.total_game_number],
          ['플레이 시간', data.total_play_time],
          ['1 vs 1 승리횟수', '0'],
          ['단체전 승리횟수', '0'],
          ['공격 횟수', data.total_game_number],
        ];
        setStatsticsList([...statsticsDatas]);
        setStateMessage(data.state_message);
        //setRecentList([...recentDatas]);
      })
      .catch((error) => console.log('error:', error));
    return () => {};
  }, [nickname]);

  return (
    <div className="profile">
      <div className="profile-section">
        <SectionTitle>프로필</SectionTitle>
        <img
          className="profile-section__image"
          src="assets/profile.png"
          alt="이미지 다운로드 실패"
        ></img>
        <span className="profile-section__player">{`[ ${nickname} ]`}</span>
        <textarea
          maxLength={50}
          minLength={1}
          className="profile-section__status"
          disabled={!editMode}
          value={stateMessage}
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
          <div className="stastics-list">{drawStastics(statsticsList)}</div>
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
            <div className="recent-list">{drawRecent(recentList)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
