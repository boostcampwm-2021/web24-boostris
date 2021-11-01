import React from 'react';
import './style.scss';

function OauthLoginButton({
  children,
  name = '',
  handleClick = () => {},
}: {
  children: React.ReactNode;
  name: string;
  handleClick: () => void;
}) {
  return (
    <button className="oauth__btn--root" onClick={handleClick}>
      <span className={`oauth__name--${name}`}>{children}</span> Login
    </button>
  );
}

export default OauthLoginButton;
