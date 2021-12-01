import React, { useEffect, useRef, useState } from 'react';
import './style.scss';
import SectionTitle from '../../components/SectionTitle';
import useAuth from '../../hooks/use-auth';
import AppbarLayout from '../../layout/AppbarLayout';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch } from '../../app/hooks';
import { updateNickname } from '../../features/user/userSlice';
import { useSocket, useSocketReady } from '../../context/SocketContext';
import InfiniteScroll from '../../components/InfiniteScroll';
import { fetchGetStateMessage, fetchGetTotal, fetchUpdateUserState } from './profileFetch';

const recentHeader = ['날짜', '모드', '등수', '플레이 타임', '공격 횟수', '받은 횟수'];
const translations = [
  ['total_game_cnt', '총 게임 수'],
  ['total_play_time', '총 플레이 시간'],
  ['multi_player_win', '승리 횟수'],
  ['total_attack_cnt', '총 공격 횟수'],
];

const drawRecent = (value: any) => {
  const dateObj = new Date(value.game_date);
  let timeString = dateObj.toLocaleString('en-US', { timeZone: 'Asia/Seoul' });
  const [date, time] = timeString.split(',');
  const [m, d, y] = date.split('/');

  return (
    <div className="recent__list" key={value.game_date}>
      <div>{`${y}-${m}-${d} ${time}`}</div>
      <div>{value.game_mode === 'normal' ? '일반전' : '1 vs 1'}</div>
      <div>{value.ranking}등</div>
      <div>{value.play_time}</div>
      <div>{value.attack_cnt}</div>
      <div>{value.attacked_cnt}</div>
    </div>
  );
};

export default function Profile() {
  const { nickname } = useParams();
  const authProfile = useAuth().profile;
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const nicknameRef = useRef<any>();
  const stateMessageRef = useRef<any>();

  const [statsticsState, setStatsticsState] = useState({});

  const [editMode, setEditMode] = useState(false);
  const [userState, setUserState] = useState({
    id: authProfile.id,
    nickname,
    stateMessage: '',
  });

  const socketClient = useSocket();
  const { isReady } = useSocketReady();

  const drawStatistics = (statsticsState: any) => {
    return (
      <>
        {translations.map(([key, value]) => {
          return (
            <div className="statistics-list__item" key={key}>
              <div>{value}</div>
              <div>:</div>
              <div>{statsticsState[key] || '0'}</div>
            </div>
          );
        })}
      </>
    );
  };

  const clickEditButton = async () => {
    if (!editMode) {
      setEditMode(!editMode);
      return;
    } else {
      try {
        const newNickname = nicknameRef.current.value;
        const newStateMessage = stateMessageRef.current.value;

        const res = await fetchUpdateUserState({
          ...userState,
          nickname: newNickname,
          stateMessage: newStateMessage,
        });

        if (res.message === 'done') {
          setEditMode(!editMode);
          await dispatch(updateNickname());
          socketClient.current.emit('set userName', newNickname, userState.id);
          navigate(`/profile/${newNickname}`, { replace: true });
        }
      } catch (error) {
        console.log('error:', error);
      }
    }
  };

  useEffect(() => {
    const abortController = new AbortController();
    //setUserState({ ...userState, nickname });

    (async function effect() {
      try {
        const resMsg = await fetchGetStateMessage(nickname, abortController.signal);
        setUserState({ ...userState, nickname, stateMessage: resMsg.state_message });
        nicknameRef.current.value = nickname;
        stateMessageRef.current.value = resMsg.state_message;

        const resTotal = await fetchGetTotal(nickname, abortController.signal);
        setStatsticsState({ ...statsticsState, ...resTotal });
      } catch {
        if (!abortController.signal.aborted) navigate('/error/unauthorize', { replace: true });
      }
    })();

    return () => {
      abortController.abort();
    };
  }, [nickname]);

  useEffect(() => {
    if (!isReady) return;

    const popstateEvent = (e: any) => {
      const url = e.target.location.pathname;

      if (url.includes('/game/')) {
        const gameID = url.split('/game/')[1];
        socketClient.current.emit('check valid room', { roomID: gameID, id: socketClient.id });
      }
    };

    window.addEventListener('popstate', popstateEvent);

    return () => {
      window.removeEventListener('popstate', popstateEvent);
    };
  }, [isReady]);

  return (
    <AppbarLayout>
      <div className="profile__page--root">
        <div className="profile-section">
          <SectionTitle>프로필</SectionTitle>
          <img
            className="profile-section__image"
            src="/assets/profile.png"
            alt="이미지 다운로드 실패"
          ></img>
          <input
            className={`profile-section__player ${editMode ? 'editMode' : ''}`}
            maxLength={10}
            ref={nicknameRef}
            readOnly={!editMode}
          />
          <textarea
            maxLength={50}
            minLength={1}
            className="profile-section__status"
            disabled={!editMode}
            ref={stateMessageRef}
          ></textarea>

          {authProfile.nickname === nickname && (
            <button className="profile-section__button" onClick={clickEditButton}>
              {editMode ? `Save Profile` : `Edit Profile`}
            </button>
          )}
        </div>
        <div className="total-section">
          <div className="statistics-section">
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
            <InfiniteScroll
              nickname={nickname}
              drawFunction={drawRecent}
              MAX_ROWS={4}
              fetchURL="/api/profile/recent"
              type="profile"
            />
          </div>
        </div>
      </div>
    </AppbarLayout>
  );
}
