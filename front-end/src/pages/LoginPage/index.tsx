import OauthLoginButton from '../../components/OauthLoginButton';
import { OAUTH_LIST } from '../../constants';
import './style.scss';

function LoginPage() {
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
          // handleClick={() => setOpen(true)}
          handleClick={() => {}}
        >
          {name}
        </OauthLoginButton>
      ))}
      <p className="login__title">
        (C) Attendance starts from the first number
      </p>
      {/* <Modal open={open} onClose={() => setOpen(false)}>
      hello
    </Modal> */}
    </div>
  );
}

export default LoginPage;
