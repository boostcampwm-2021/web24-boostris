import './style.scss';
import React from 'react';

function OauthLoginButton({
  children,
  name = '',
  link = '',
  button,
}: {
  children: React.ReactNode;
  name: string;
  link: string;
  button: any;
}) {
  const handleClick = () => {
    if (name === 'github') {
      window.location.href = link;
    }
  };
  return (
    <button className="oauth__btn--root" onClick={handleClick} ref={button}>
      <span className={`oauth__name--${name}`}>{children}</span> Login
    </button>
  );
}

export default OauthLoginButton;
