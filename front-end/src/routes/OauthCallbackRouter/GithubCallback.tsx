import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchGithubUser, selectUser } from '../../features/user/userSlice';
import useQueryParams from '../../hooks/use-query-params';

function GithubCallback() {
  const code = useQueryParams('code');

  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (code) {
      dispatch(fetchGithubUser(code));
    }
  }, [code, dispatch]);

  return <div>{user.profile.status}</div>;
}

export default GithubCallback;
