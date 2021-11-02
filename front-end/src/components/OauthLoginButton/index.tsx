import './style.scss';
import React, { useEffect, useState, useRef } from 'react';

function OauthLoginButton({
  children,
  name = '',
  handleClick = () => {},
  button,
}: {
  children: React.ReactNode;
  name: string;
  handleClick: () => void;
  button: any;
}) {
  return (
    <button className="oauth__btn--root" onClick={handleClick} ref={button}>
      <span className={`oauth__name--${name}`}>{children}</span> Login
    </button>
  );
}

export default OauthLoginButton;
