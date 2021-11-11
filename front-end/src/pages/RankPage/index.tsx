import { MouseEventHandler, useEffect, useRef, useState } from 'react';
import { useAppSelector } from '../../app/hooks';
import { selectUser } from '../../features/user/userSlice';
import AppbarLayout from '../../layout/AppbarLayout';
import './style.scss';

const fetchGetRank: Function = async (rankApiTemplate: Object) => {
  return fetch(`/api/rank`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ rankApiTemplate }),
  }).then((res) => res.json());
};

const fetchGetMyCntInfo: Function = async (myInfoTemplate: Object) => {
  return fetch(`/api/rank/myInfo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ myInfoTemplate }),
  }).then((res) => res.json());
};

const syncKeyWithServer = (
  rankApiTemplate: any,
  categoryButtonState: any,
  modeButtonState: any
) => {
  const valueChanger = {
    category: ['attackCnt', 'totalWin'],
    mode: ['normal', '1 vs 1'],
  };
  rankApiTemplate.category = valueChanger.category[categoryButtonState];
  rankApiTemplate.mode = valueChanger.mode[modeButtonState];
};

function RankItemBox({ obj }: any) {
  return (
    <div className="rank__display__itembox">
      <div className="rank__display__item display__rank">{obj['ranking']}등</div>
      <div className="rank__display__item display__nickname">{obj['nickname']}</div>
      <div className="rank__display__item display__message">
        {obj['ANY_VALUE(u.state_message)']}
      </div>
      <div className="rank__display__item display__win">{obj[Object.keys(obj)[1]]}</div>
    </div>
  );
}

function RankPage() {
  const rankApiTemplate: any = {
    category: 'totalWin',
    mode: '1 vs 1',
    nickName: '',
    offsetRank: '',
    lastNickName: '',
  };

  const categoryChange = ['공격 횟수', '승리 횟수'];

  const [categoryButtonState, categoryButtonChange] = useState(1);
  const [modeButtonState, modeButtonChange] = useState(1);
  const [players, changePlayerLists] = useState([]);
  const [myInfo, changeMyInfo] = useState([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const user = useAppSelector(selectUser);

  const categoryButton: MouseEventHandler<HTMLButtonElement> = (e: any) => {
    const value = e.target.id === 'attackCnt' ? 0 : 1;
    categoryButtonChange(value);
  };

  const modeButton: MouseEventHandler<HTMLButtonElement> = (e: any) => {
    const value = e.target.id === 'normal' ? 0 : 1;
    modeButtonChange(value);
  };

  const searchButton: MouseEventHandler<HTMLButtonElement> = async (e: any) => {
    rankApiTemplate.nickName = inputRef?.current?.value;
    syncKeyWithServer(rankApiTemplate, categoryButtonState, modeButtonState);
    const res = await fetchGetRank(rankApiTemplate);
    changePlayerLists(res.data);
  };

  useEffect(() => {
    (async function effect() {
      let value: any = await fetchGetMyCntInfo({ nickname: user.profile.nickname });
      const playerWin = value.data?.['sum(player_win)'];
      const attackCnt = value.data?.['sum(attack_cnt)'];
      const tmp: any = [playerWin, attackCnt];
      changeMyInfo(tmp);
    })();
  }, []);

  useEffect(() => {
    (async function effect() {
      syncKeyWithServer(rankApiTemplate, categoryButtonState, modeButtonState);
      const res = await fetchGetRank(rankApiTemplate);
      changePlayerLists(res.data);
    })();
  }, [categoryButtonState, modeButtonState]);

  return (
    <AppbarLayout>
      <div className="rank__page--root">
        <div className="rank__header">&gt; 랭킹</div>
        <div className="rank__body">
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
        <div className="rank__display">
          <div className="rank__display__itembox display__header">
            <div className="rank__display__item display__rank">등수</div>
            <div className="rank__display__item display__nickname">닉네임</div>
            <div className="rank__display__item display__message">상태 메세지</div>
            <div className="rank__display__item display__win">
              {categoryChange[categoryButtonState]}
            </div>
          </div>
          <div className="rank__display__scroll__root">
            <div className="rank__display__itembox display__body">
              {players.map((obj) => (
                <RankItemBox key={obj['nickname']} obj={obj} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppbarLayout>
  );
}

export default RankPage;
