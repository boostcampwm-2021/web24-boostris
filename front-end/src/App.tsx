import { Route, Routes } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import OauthCallbackRouter from './routes/OauthCallbackRouter';

import { useEffect } from 'react';
import { useAppDispatch } from './app/hooks';
import { checkAuth } from './features/user/userSlice';
import useAuth from './hooks/use-auth';
import WithSocketPage from './pages/WithSocketPage';
import RequireAuth from './routes/RequireAuth';
import LobbyPage from './pages/LobbyPage';
import Tetris from './components/Tetris';
import GamePage from './pages/GamePage';
import RankPage from './pages/RankPage';
import './App.scss';

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
    <div className="App">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/oauth/*" element={<OauthCallbackRouter />} />
        <Route path="/*" element={<WithSocketPage />}>
          <Route
            path=""
            element={
              <RequireAuth>
                <LobbyPage />
              </RequireAuth>
            }
          />
          <Route
            path="tetris"
            element={
              <RequireAuth>
                <Tetris />
              </RequireAuth>
            }
          />
          <Route
            path="game/:gameID"
            element={
              <RequireAuth>
                <GamePage />
              </RequireAuth>
            }
          />
          <Route path="rank" element={<RankPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
