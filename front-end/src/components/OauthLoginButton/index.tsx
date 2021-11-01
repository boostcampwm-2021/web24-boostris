import React from 'react';
import './style.scss';

function OauthLoginButton({
  children,
  name,
}: {
  children: React.ReactNode;
  name: string;
}) {
  return <button>{children} Login</button>;
}

export default OauthLoginButton;
