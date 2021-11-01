import React from 'react';
import './style.scss';

function OauthLoginButton({
  children,
  name,
}: {
  children: React.ReactNode;
  name: string;
}) {
  return (
    <button>
      <span className={`oauth__name--${name}`}>{children}</span> Login
    </button>
  );
}

export default OauthLoginButton;
