import { useEffect } from 'react';
import {
  match,
  Route,
  Switch,
  useHistory,
  useRouteMatch,
} from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { selectUser } from '../../features/user/userSlice';
import GithubCallback from './GithubCallback';
import GoogleCallback from './GoogleCallback';
import NaverCallback from './NaverCallback';

function OauthCallbackRouter() {
  const { path }: match = useRouteMatch();
  const history = useHistory();

  const user = useAppSelector(selectUser);

  useEffect(() => {
    if (
      (user.profile.id && user.status === 'idle') ||
      user.status === 'failed'
    ) {
      if (user.profile.isOurUser) {
        history.replace('/');
      } else {
        history.replace('/register');
      }
    }
  }, [history, user.profile.id, user.profile.isOurUser, user.status]);

  return (
    <Switch>
      <Route path={`${path}/github`}>
        <GithubCallback />
      </Route>
      <Route path={`${path}/naver`}>
        <NaverCallback />
      </Route>
      <Route path={`${path}/google`}>
        <GoogleCallback />
      </Route>
    </Switch>
  );
}

export default OauthCallbackRouter;
