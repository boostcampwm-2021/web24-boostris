import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './style.scss';
import { unauthorize, duplicate, magician } from './constants';
import BubbleButton from '../../components/BubbleButton';

export default function ErrorPage() {
  const { title } = useParams();
  const navigate = useNavigate();
  const [leftTime, setLeftTime] = useState(10);
  let pageText = '잘못된 URL에 오셨군요!\n';

  switch (title) {
    case 'duplicate':
      pageText = duplicate;
      break;
    case 'unauthorize':
      pageText = unauthorize;
      break;
    default:
      break;
  }

  useEffect(() => {
    if (title === 'duplicate') return;
    const startTime = Date.now();
    const autoMoveLobby = setTimeout(() => {
      navigate('/', { replace: true });
    }, 10000);

    const printLeftTime = () =>
      setLeftTime(Math.floor((10000 - (Date.now() - startTime)) / 1000) + 1);

    const autoInterval = setInterval(printLeftTime, 1000);

    return () => {
      clearTimeout(autoMoveLobby);
      clearInterval(autoInterval);
    };
  }, []);

  return (
    <div className="error__page--root">
      <div className="error__page__title">놀라지 마세요!</div>
      <img src="/assets/error.png" alt="" />
      <div className="error__page__text">{pageText}</div>

      {title !== 'duplicate' && (
        <>
          <div className="error__page__magician">{`${magician}${leftTime}`}</div>
          <BubbleButton
            variant="active"
            label="로비로 이동하기"
            handleClick={() => navigate('/', { replace: true })}
            disabled={false}
          />
        </>
      )}
    </div>
  );
}
