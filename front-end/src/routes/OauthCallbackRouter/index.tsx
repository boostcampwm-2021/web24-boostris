import { match, Route, Switch, useRouteMatch } from 'react-router-dom';
import GithubCallback from './GithubCallback';

function OauthCallbackRouter() {
  const { path }: match = useRouteMatch();
  return (
    <Switch>
      <Route path={`${path}/github`}>
        <GithubCallback />
      </Route>
    </Switch>
  );
}

export default OauthCallbackRouter;
