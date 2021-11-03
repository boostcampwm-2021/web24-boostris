import { useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

function GoogleCallback() {
  const history = useHistory();
  const { state } = useLocation();

  const loginSuccess = async (res: any) => {
    const googleUserInfo = {
      email: res.profileObj.email,
      name: res.profileObj.name,
      vendor: 'google',
    };
    let response = await fetch(`/auth/google/user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(googleUserInfo),
    });
    return response.json();
  };

  useEffect(() => {
    loginSuccess(state).then(({ email, isOurUser }) => {
      if (isOurUser) {
        history.replace('/', { email});
      } else {
        history.replace('/register', { email } );
      }
    });
  }, [history, state]);

  return <div>Redirecting...</div>;
}
export default GoogleCallback;
