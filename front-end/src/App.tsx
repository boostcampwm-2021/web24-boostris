import React from 'react';
import './App.scss';
import OauthLoginButton from './components/OauthLoginButton';
import { OAUTH_LIST } from './constants';

function App() {
  return (
    <div className="App">
      <div>
        <img src="assets/logo.png" alt="" />
      </div>
      <p className="login__title">SELECT Login Button</p>
      {OAUTH_LIST.map((name) => (
        <OauthLoginButton key={name} name={name}>
          {name}
        </OauthLoginButton>
      ))}
      <p className="login__title">
        (C) Attendance starts from the first number{' '}
      </p>
    </div>
  );
}

export default App;
