import React from 'react';
import './style.scss';
import SectionTitle from '../../components/SectionTitle';
import Line from '../../components/Line';

export default function Profile() {
  const drawStastics = () => {
    const statsticsList = [
      ['게임 수', 1],
      ['플레이 시간', 2],
      ['1 vs 1 승리횟수', 1],
      ['단체전 승리횟수', 1],
      ['공격 횟수', 1],
    ];

    return (
      <>
        {statsticsList.map(([key, value], i) => {
          return (
            <div className="stastics-list__item">
              <div>{key}</div>
              <div>:</div>
              <div>{value}</div>
            </div>
          );
        })}
      </>
    );
  };

  const drawRecent = () => {
    const recentList = [
      ['2021-10-22', '4명', '1등', '2:23:10', '21', '22'],
      ['2021-10-22', '4명', '1등', '2:23:10', '21', '22'],
      ['2021-10-22', '4명', '1등', '2:23:10', '21', '22'],
      ['2021-10-22', '4명', '1등', '2:23:10', '21', '22'],
      ['2021-10-22', '4명', '1등', '2:23:10', '21', '22'],
      ['2021-10-22', '4명', '1등', '2:23:10', '21', '22'],
      ['2021-10-22', '4명', '1등', '2:23:10', '21', '22'],
      ['2021-10-22', '4명', '1등', '2:23:10', '21', '22'],
    ];

    return <>{recentList.map((row, i) => row.map((value, j) => <div>{value}</div>))}</>;
  };

  const recentHeader = ['날짜', '인원', '등수', '플레이 타임', '공격 횟수', '받은 횟수'];

  return (
    <div className="profile">
      <div className="profile-section">
        <SectionTitle>프로필</SectionTitle>
        <img
          className="profile-section__image"
          src="assets/profile.png"
          alt="이미지 다운로드 실패"
        ></img>
        <span className="profile-section__player">플레이어명</span>
        <div className="profile-section__status">상태메세지</div>
        <button className="profile-section__button">Edit Profile</button>
      </div>
      <div className="total-section">
        <div className="stastics-section">
          <div className="stastics-section__header">
            <SectionTitle>통계</SectionTitle>
            <div>X</div>
          </div>
          <Line marginTop="13" marginBottom="18" marginRight="0" marginLeft="0" />
          <div className="stastics-list">{drawStastics()}</div>
        </div>
        <div className="recent-section">
          <SectionTitle>최근 기록</SectionTitle>
          <Line marginTop="13" marginBottom="18" marginRight="0" marginLeft="0" />
          <div className="recent-list__header">
            {recentHeader.map((value) => (
              <div>{value}</div>
            ))}
          </div>
          <div className="recent-list__scroll">
            <div className="recent-list">{drawRecent()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
