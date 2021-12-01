import { useEffect, useRef } from 'react';
import GoogleLogin from 'react-google-login';
import { NavigateOptions, useNavigate } from 'react-router-dom';
import OauthLoginButton from '../../components/OauthLoginButton';
import { OAUTH_LIST } from '../../constants';
import useAuth from '../../hooks/use-auth';
import './style.scss';

declare const window: any;

function LoginPage() {
  const naverLog: any = useRef(null);
  const googleLog: any = useRef();
  const googleCLientID: string = process.env.REACT_APP_GOOGLE_CLIENTID || '';
  const navigate = useNavigate();

  const { auth } = useAuth();
  useEffect(() => {
    if (auth.authenticated) {
      navigate('/');
    }
  }, [auth.authenticated, navigate]);

  const handleClick = (e: MouseEvent, name: string) => {
    if (name === 'github') {
      window.location.href = process.env.REACT_APP_GITHUB_CALLBACK_URL;
    }
    if (name === 'naver') {
      const btnNaverLogin = naverLog.current.firstChild;
      btnNaverLogin.click();
    }
    if (name === 'google') {
      const btnGoogleLogin = googleLog.current.firstChild;
      btnGoogleLogin.click();
    }
  };

  useEffect(() => {
    const naverLogin = new window.naver.LoginWithNaverId({
      clientId: process.env.REACT_APP_NAVER_CLIENTID,
      callbackUrl: process.env.REACT_APP_NAVER_CALLBACKURL,
      callbackHandle: true,
      loginButton: {
        color: 'black',
        type: 1,
      },
    });
    naverLogin.init();
  }, []);

  return (
    <div className="login__root full__page--root">
      <div>
        <img src="assets/logo.png" width={318} height={64} alt="" />
      </div>
      <p className="login__title">SELECT Login Button</p>
      {OAUTH_LIST.map(({ type }, idx) => (
        <OauthLoginButton key={type} name={type} handleClick={handleClick}>
          {type}
          {type === 'naver' && <div id="naverIdLogin" ref={naverLog} />}
          {type === 'google' && (
            <div id="googleIdLogin" ref={googleLog}>
              <GoogleLogin
                clientId={googleCLientID}
                buttonText="Google"
                onSuccess={(result) =>
                  navigate('/oauth/google', {
                    state: { ...result },
                  } as NavigateOptions)
                }
                onFailure={(result) => console.log(result)}
              />
            </div>
          )}
        </OauthLoginButton>
      ))}
      <p className="login__title">(C) Attendance starts from the first number</p>
    </div>
  );
}

export default LoginPage;
