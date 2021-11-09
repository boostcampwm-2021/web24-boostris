import { useEffect, useRef, useState } from 'react';
import AppbarLayout from '../../layout/AppbarLayout';
import './style.scss';

function RankPage() {
  const rankApiTemplate = {
    category: 'attackCnt',
    mode: '',
    nickName: '',
    offsetCnt: '',
    offsetDate: '',
  };

  const [categoryButtonState, categoryButtonChange] = useState(0);

  function categoryButton(e: any) {}

  useEffect(() => {}, []);

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
              <div className="rank__player__rank__row">플레이어</div>
              <div className="rank__player__rank__row">승리횟수 : 1번</div>
              <div className="rank__player__rank__row">공격횟수 : 1번</div>
            </div>
          </div>
          <div className="rank__input__box">
            <div className="rank__input__box__row">
              분류 :{' '}
              <button className="rank__input__box__button" onClick={categoryButton}>
                승리 횟수
              </button>
              <button className="rank__input__box__button" onClick={categoryButton}>
                공격 횟수
              </button>
            </div>
            <div className="rank__input__box__row">
              모드 : <div className="rank__input__box__button">1 vs 1</div>
              <div className="rank__input__box__button">일반전</div>
            </div>
            <div className="rank__nickname">
              <input
                className="rank__input__box__nickname"
                placeholder="플레이어 닉네임을 입력해주세요."
              ></input>
              <button className="rank__input__box__button rank__nickname__search">검색</button>
            </div>
          </div>
        </div>
        <div className="rank__display">
          <div className="rank__display__itembox display__header">
            <div className="rank__display__item display__rank">등수</div>
            <div className="rank__display__item display__nickname">닉네임</div>
            <div className="rank__display__item display__message">상태 메세지</div>
            <div className="rank__display__item display__win">승리 횟수</div>
          </div>
          <div className="rank__display__itembox">
            <div className="rank__display__item display__rank">1등</div>
            <div className="rank__display__item display__nickname">플레이어1</div>
            <div className="rank__display__item display__message">
              플레이어의 상태 메세지가 들어갑니다.
            </div>
            <div className="rank__display__item display__win">3</div>
          </div>
          <div className="rank__display__itembox">
            <div className="rank__display__item display__rank">1등</div>
            <div className="rank__display__item display__nickname">플레이어1</div>
            <div className="rank__display__item display__message">
              플레이어의 상태 메세지가 들어갑니다.
            </div>
            <div className="rank__display__item display__win">3</div>
          </div>
          <div className="rank__display__itembox">
            <div className="rank__display__item display__rank">1등</div>
            <div className="rank__display__item display__nickname">플레이어1</div>
            <div className="rank__display__item display__message">
              플레이어의 상태 메세지가 들어갑니다.
            </div>
            <div className="rank__display__item display__win">3</div>
          </div>
          <div className="rank__display__itembox">
            <div className="rank__display__item display__rank">1등</div>
            <div className="rank__display__item display__nickname">플레이어1</div>
            <div className="rank__display__item display__message">
              플레이어의 상태 메세지가 들어갑니다.
            </div>
            <div className="rank__display__item display__win">3</div>
          </div>
          <div className="rank__display__itembox">
            <div className="rank__display__item display__rank">1등</div>
            <div className="rank__display__item display__nickname">플레이어1</div>
            <div className="rank__display__item display__message">
              플레이어의 상태 메세지가 들어갑니다.
            </div>
            <div className="rank__display__item display__win">3</div>
          </div>
        </div>
      </div>
    </AppbarLayout>
  );
}

export default RankPage;
