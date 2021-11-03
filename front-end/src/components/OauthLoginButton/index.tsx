import './style.scss';
import React, { useEffect, useRef } from 'react';
import GoogleLogin from 'react-google-login';
import { useHistory } from 'react-router-dom';

declare const window: any;

function OauthLoginButton({
  children,
  name = '',
  link = '',
}: {
  children: React.ReactNode;
  name: string;
  link: string;
}) {
  const history = useHistory();
  const naverLog: any = useRef(null);
  const googleLog: any = useRef();

  const googleCLientID: string = process.env.REACT_APP_GOOGLE_CLIENTID || '';

  useEffect(() => {
    if (name === 'naver') {
      const naverLogin = new window.naver.LoginWithNaverId({
        clientId: process.env.REACT_APP_NAVER_CLIENTID,
        callbackUrl: process.env.REACT_APP_NAVER_CALLBACKURL,
        callbackHandle: true,
        loginButton: {
          color: 'black',
          type: 1,
          height: 20,
        },
      });
      naverLogin.init();
    }
  }, [name]);

  const handleClick = () => {
    if (name === 'github') {
      window.location.href = link;
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

  return (
    <div className="oauth__btn--root" onClick={handleClick}>
      <span className={`oauth__name--${name}`}>{children}</span> Login
      {name === 'naver' && <div id="naverIdLogin" ref={naverLog} />}
      {name === 'google' && (
        <div id="googleIdLogin" ref={googleLog}>
          <GoogleLogin
            clientId={googleCLientID}
            buttonText="Google"
            onSuccess={(result) => history.push('/oauth/google', { ...result })}
            onFailure={(result) => console.log(result)}
          />
        </div>
      )}
    </div>
  );
}

export default OauthLoginButton;
