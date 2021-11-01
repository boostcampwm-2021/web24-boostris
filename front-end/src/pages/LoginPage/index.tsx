import { useRef } from 'react';
import Modal from '../../components/Modal';
import NaverLogin from '../../components/naver';
import OauthLoginButton from '../../components/OauthLoginButton';
import { OAUTH_LIST } from '../../constants';
import './style.scss';

function LoginPage() {
  const modalRef = useRef<any>();
  const button = [useRef(), useRef(), useRef()];
  let i = 0;

  return (
    <div className="login__root full__page--root">
      <div>
        <img src="assets/logo.png" alt="" />
      </div>
      <p className="login__title">SELECT Login Button</p>
      {OAUTH_LIST.map((name) => (
        <OauthLoginButton
          key={name}
          name={name}
          handleClick={() => modalRef.current.open()}
          button={button[i++]}
        >
          {name}
        </OauthLoginButton>
      ))}
      <p className="login__title">
        (C) Attendance starts from the first number
      </p>
      <Modal ref={modalRef}>hello</Modal>
      <NaverLogin button={button[0]} />
    </div>
  );
}

export default LoginPage;
