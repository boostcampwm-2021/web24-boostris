import { useRef } from 'react';
import Modal from '../../components/Modal';
import NaverLogin from '../../components/naver';
import GoogleLoginComponent from '../../components/google';
import OauthLoginButton from '../../components/OauthLoginButton';
import { OAUTH_LIST, OAUTH_LIST_INDEX } from '../../constants';
import './style.scss';

function LoginPage() {
  const modalRef = useRef<any>();
  const button = [useRef(), useRef(), useRef()];

  return (
    <div className="login__root full__page--root">
      <div>
        <img src="assets/logo.png" alt="" />
      </div>
      <p className="login__title">SELECT Login Button</p>
      {OAUTH_LIST.map(({ type, link }, idx) => (
        <OauthLoginButton
          key={type}
          name={type}
          link={link}
          button={button[idx]}
        >
          {type}
        </OauthLoginButton>
      ))}
      <p className="login__title">
        (C) Attendance starts from the first number
      </p>
      <Modal ref={modalRef}>hello</Modal>
      <NaverLogin button={button[OAUTH_LIST_INDEX['naver']]} />
      <GoogleLoginComponent button={button[OAUTH_LIST_INDEX['google']]} />
    </div>
  );
}

export default LoginPage;
