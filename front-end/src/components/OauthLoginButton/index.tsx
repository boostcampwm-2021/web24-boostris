import React, { useEffect } from 'react';
import './style.scss';

function OauthLoginButton({
  children,
  name = '',
  handleClick = () => {},
}: {
  children: React.ReactNode;
  name: string;
  handleClick: Function;
}) {
  useEffect(() => {}, [name]);

  return (
    <div className="oauth__btn--root" onClick={(e) => handleClick(e, name)}>
      <span className={`oauth__name--${name}`}>{children}</span> Login
    </div>
  );
}

export default OauthLoginButton;
