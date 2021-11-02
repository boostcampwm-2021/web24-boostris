import { useRef } from 'react';
import Modal from '../../components/Modal';
import OauthLoginButton from '../../components/OauthLoginButton';
import { OAUTH_LIST } from '../../constants';
import './style.scss';

function LoginPage() {
  const modalRef = useRef<any>();

  return (
    <div className="login__root full__page--root">
      <div>
        <img src="assets/logo.png" alt="" />
      </div>
      <p className="login__title">SELECT Login Button</p>
      {OAUTH_LIST.map(({ type, link }, idx) => (
        <OauthLoginButton key={type} name={type} link={link}>
          {type}
        </OauthLoginButton>
      ))}
      <p className="login__title">
        (C) Attendance starts from the first number
      </p>
      <Modal ref={modalRef}>hello</Modal>
    </div>
  );
}

export default LoginPage;
