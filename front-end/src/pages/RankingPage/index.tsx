import React, { MouseEvent, MouseEventHandler, useEffect, useRef, useState } from 'react';
import { useAppSelector } from '../../app/hooks';
import { selectUser } from '../../features/user/userSlice';
import { fetchGetRank, fetchGetMyCntInfo } from './rankFetch';
import AppbarLayout from '../../layout/AppbarLayout';
import { useSocket, useSocketReady } from '../../context/SocketContext';
import './style.scss';

interface RankApiTemplateObject {
  category: string;
  mode: string;
  nickName: string | undefined;
  offsetRank: string;
  lastNickName: string;
}

const syncKeyWithServer = (
  rankApiTemplate: RankApiTemplateObject,
  categoryButtonState: number,
  modeButtonState: number
) => {
  const valueChanger = {
    category: ['attackCnt', 'totalWin'],
    mode: ['normal', '1 vs 1'],
  };
  rankApiTemplate.category = valueChanger.category[categoryButtonState];
  rankApiTemplate.mode = valueChanger.mode[modeButtonState];
};

function RankLeftProfile() {
  const [myInfo, setMyInfo] = useState([]);
  const user = useAppSelector(selectUser);
  useEffect(() => {
    const abortController = new AbortController();

    (async function effect() {
      try {
        const myInfo = await fetchGetMyCntInfo(
          { oauthId: user.profile.id },
          abortController.signal
        );
        const playerWin = myInfo.data?.['player_win'];
        const attackCnt = myInfo.data?.['attack_cnt'];
        const tmp: any = [playerWin, attackCnt];
        setMyInfo(tmp);
      } catch (e) {
        if (!abortController.signal.aborted) console.log(e);
      }
    })();

    return () => {
      abortController.abort();
    };
  }, []);

  return (
    <div className="rank__player__box">
      <div className="rank__player__image">
        <img src="assets/profile.png" alt="" height="98" width="86" />
      </div>
      <div className="rank__player__rank">
        <div className="rank__player__rank__row">{user.profile.nickname}</div>
        <div className="rank__player__rank__row">승리횟수 : {myInfo[0]}번</div>
        <div className="rank__player__rank__row">공격횟수 : {myInfo[1]}번</div>
      </div>
    </div>
  );
}

function RankItemBox({ obj }: any) {
  return (
    <div className="rank__display__itembox">
      <div className="rank__display__item display__rank">{obj.ranking}등</div>
      <div className="rank__display__item display__nickname">{obj.nickname}</div>
      <div className="rank__display__item display__message">{obj.state_message}</div>
      <div className="rank__display__item display__win">{obj.category}</div>
    </div>
  );
}

function RankingPage() {
  const rankApiTemplate: RankApiTemplateObject = {
    category: 'totalWin',
    mode: '1 vs 1',
    nickName: '',
    offsetRank: '',
    lastNickName: '',
  };

  const socketClient = useSocket();
  const { isReady } = useSocketReady();

  const categoryChange = ['공격 횟수', '승리 횟수'];
  const [categoryButtonState, setCategoryButtonState] = useState(1);
  const [modeButtonState, setModeButtonState] = useState(1);
  const [players, setPlayers] = useState([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const categoryButton: MouseEventHandler<HTMLButtonElement> = (
    e: MouseEvent<HTMLButtonElement>
  ) => {
    const value = (e.target as Element).id === 'attackCnt' ? 0 : 1;
    setCategoryButtonState(value);
  };

  const modeButton: MouseEventHandler<HTMLButtonElement> = (e: MouseEvent<HTMLButtonElement>) => {
    const value = (e.target as Element).id === 'normal' ? 0 : 1;
    setModeButtonState(value);
  };

  const searchButton: MouseEventHandler<HTMLButtonElement> = async (
    e: MouseEvent<HTMLButtonElement>
  ) => {
    rankApiTemplate.nickName = inputRef?.current?.value;
    syncKeyWithServer(rankApiTemplate, categoryButtonState, modeButtonState);
    const res = await fetchGetRank(rankApiTemplate);
    setPlayers(res.data);
  };

  useEffect(() => {
    const abortController = new AbortController();
    (async function effect() {
      try {
        syncKeyWithServer(rankApiTemplate, categoryButtonState, modeButtonState);
        const res = await fetchGetRank(rankApiTemplate, abortController.signal);
        setPlayers(res.data);
      } catch (e) {
        if (!abortController.signal.aborted) console.log(e);
      }
    })();

    return () => {
      abortController.abort();
    };
  }, [categoryButtonState, modeButtonState]);

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
      <div className="rank__page--root">
        <div className="rank__header">&gt; 랭킹</div>
        <div className="rank__body">
          <RankLeftProfile />
          <div className="rank__input__box">
            <div className="rank__input__box__row">
              분류 :{' '}
              <button
                id="totalWin"
                className={`rank__input__box__button ${categoryButtonState && 'selected'}`}
                onClick={categoryButton}
              >
                승리 횟수
              </button>
              <button
                id="attackCnt"
                className={`rank__input__box__button ${!categoryButtonState && 'selected'}`}
                onClick={categoryButton}
              >
                공격 횟수
              </button>
            </div>
            <div className="rank__input__box__row">
              모드 :
              <button
                id="1 vs 1"
                className={`rank__input__box__button ${modeButtonState && 'selected'}`}
                onClick={modeButton}
              >
                1 vs 1
              </button>
              <button
                id="normal"
                className={`rank__input__box__button ${!modeButtonState && 'selected'}`}
                onClick={modeButton}
              >
                일반전
              </button>
            </div>
            <div className="rank__nickname">
              <input
                className="rank__input__box__nickname"
                placeholder="플레이어 닉네임을 입력해주세요."
                ref={inputRef}
              ></input>
              <button
                className="rank__input__box__button rank__nickname__search"
                onClick={searchButton}
              >
                검색
              </button>
            </div>
          </div>
        </div>
        <div className="rank__body__down">
          <div className="rank__display">
            <div className="rank__display__itembox display__header">
              <div className="rank__display__item display__rank">등수</div>
              <div className="rank__display__item display__nickname">닉네임</div>
              <div className="rank__display__item display__message">상태 메세지</div>
              <div className="rank__display__item display__win">
                {categoryChange[categoryButtonState]}
              </div>
            </div>
            <div className="rank__display__scroll__root fancy__scroll">
              <div className="rank__display__itembox display__body">
                {players.map((obj) => (
                  <RankItemBox key={obj['nickname']} obj={obj} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppbarLayout>
  );
}

export default RankingPage;
