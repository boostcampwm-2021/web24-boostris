import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import useQueryParams from '../../hooks/use-query-params';

function GithubCallback() {
  const urlSearch = useQueryParams();
  const history = useHistory();

  useEffect(() => {
    const fetchGithubUserData = async () => {
      const response = await fetch('/auth/github/code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          code: `${urlSearch.get('code')}`,
        }),
      });
      return response.json();
    };
    fetchGithubUserData()
      .then(({ user }) => {
        if (user.isOurUser) {
          history.replace('/', { user });
        } else {
          history.replace('/register');
        }
      })
      .catch((err) => {
        alert(err);
      });
  }, [history, urlSearch]);

  return <div></div>;
}

export default GithubCallback;
