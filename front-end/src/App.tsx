import React, { useState } from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';

import './App.scss';
import LobbyPage from './pages/LobbyPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NaverLogin from './components/login';
import OauthCallbackRouter from './routes/OauthCallbackRouter';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Switch>
          {/* <PrivateRoute exact path="/" component={Town} /> */}
          <Route exact path="/" component={LobbyPage} />
          <Route path="/login" component={LoginPage} />
          <Route path="/register" component={RegisterPage} />
          <Route path="/tetris">tetrishere</Route>
          <Route path="/naver/login" component={NaverLogin} />
          {/* <Route
              path="/callback"
              render={(props) => <Callback {...props} />}
            /> */}
          <Route path="/oauth" component={OauthCallbackRouter}></Route>
          {/* <Redirect path="*" to="/" /> */}
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
