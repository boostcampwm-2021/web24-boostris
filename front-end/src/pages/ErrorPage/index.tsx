import React from 'react';
import { useParams } from 'react-router-dom';
import './style.scss';

export default function ErrorPage() {
  const { title } = useParams();

  let pageText = '에러 발생';

  switch (title) {
    case 'duplicate':
      pageText = `
    어라! 이미 다른 탭에서 로그인이 되어있으시네요!

    다른 탭에서 로그인이 되어있는지 확인해주시고, 

    로그인은 한 곳에서만 부탁드립니다 (づ￣ 3￣)づ
    `;
      break;
    default:
      break;
  }

  return (
    <div className="error__page--root">
      <div className="error__page__title">놀라지 마세요!</div>
      <img src="/assets/error.png" alt="" />
      <div className="error__page__text">{pageText}</div>
    </div>
  );
}
