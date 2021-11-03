import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchGithubUser, selectUser } from '../../features/user/userSlice';
import useQueryParams from '../../hooks/use-query-params';

function GithubCallback() {
  const code = useQueryParams('code');
  const history = useHistory();

  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (code) {
      dispatch(fetchGithubUser(code));
    }
  }, [code, dispatch]);

  useEffect(() => {
    if (
      (user.profile.id && user.status === 'idle') ||
      user.status === 'failed'
    ) {
      if (user.profile.isOurUser) {
        history.replace('/', { id: user.profile.id });
      } else {
        history.replace('/register', { id: user.profile.id });
      }
    }
  }, [history, user.profile.id, user.profile.isOurUser, user.status]);

  return <div>{user.status}</div>;
}

export default GithubCallback;
