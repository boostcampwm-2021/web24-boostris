import { Route, Routes } from 'react-router-dom';

import { useEffect, lazy, Suspense } from 'react';
import { useAppDispatch } from './app/hooks';
import { checkAuth } from './features/user/userSlice';
import useAuth from './hooks/use-auth';
import OauthCallbackRouter from './routes/OauthCallbackRouter';
import RequireAuth from './routes/RequireAuth';
import './App.scss';

const Login = lazy(() => import('./pages/LoginPage'));
const Register = lazy(() => import('./pages/RegisterPage'));
const Profile = lazy(() => import('./pages/ProfilePage'));
const WithSocket = lazy(() => import('./pages/WithSocketPage'));
const Lobby = lazy(() => import('./pages/LobbyPage'));
const Game = lazy(() => import('./pages/GamePage'));
const Ranking = lazy(() => import('./pages/RankingPage'));
const Error = lazy(() => import('./pages/ErrorPage'));

function App() {
  let { auth } = useAuth();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (auth.status === 'loading') {
    return <div className="App">loading...</div>;
  }

  return (
    <Suspense
      fallback={
        <div style={{ height: '100vh', color: 'white', background: '#1c2137' }}>loading</div>
      }
    >
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/oauth/*" element={<OauthCallbackRouter />} />
          <Route path="/*" element={<WithSocket />}>
            <Route
              path=""
              element={
                <RequireAuth>
                  <Lobby />
                </RequireAuth>
              }
            />
            <Route
              path="game/:gameID"
              element={
                <RequireAuth>
                  <Game />
                </RequireAuth>
              }
            />
            <Route path="rank" element={<Ranking />} />
            <Route path="profile/:nickname" element={<Profile />} />
            <Route path="error/:title" element={<Error />} />
          </Route>
        </Routes>
      </div>
    </Suspense>
  );
}

export default App;
