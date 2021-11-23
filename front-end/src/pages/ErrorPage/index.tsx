import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './style.scss';
import { unauthorize, duplicate } from './constants';
import BubbleButton from '../../components/BubbleButton';

export default function ErrorPage() {
  const { title } = useParams();
  const navigate = useNavigate();

  let pageText = '에러 발생';

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

  return (
    <div className="error__page--root">
      <div className="error__page__title">놀라지 마세요!</div>
      <img src="/assets/error.png" alt="" />
      <div className="error__page__text">{pageText}</div>
      {title !== 'duplicate' && (
        <BubbleButton
          variant="active"
          label="로비로 이동하기"
          handleClick={() => navigate('/', { replace: true })}
          disabled={false}
        />
      )}
    </div>
  );
}
