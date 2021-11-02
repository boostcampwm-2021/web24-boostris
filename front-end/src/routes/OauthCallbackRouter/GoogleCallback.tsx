import { useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

function GoogleCallback() {
  const history = useHistory();

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
  const { state } = useLocation();

  useEffect(() => {
    loginSuccess(state).then(({ name }) => {
      history.replace('/', { name });
    });
  }, [history, state]);

  return <div>Redirecting...</div>;
}
export default GoogleCallback;
