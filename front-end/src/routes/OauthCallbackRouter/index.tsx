import { match, Route, Switch, useRouteMatch } from 'react-router-dom';
import GithubCallback from './GithubCallback';
import GoogleCallback from './GoogleCallback';
import NaverCallback from './NaverCallback';

function OauthCallbackRouter() {
  const { path }: match = useRouteMatch();
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
