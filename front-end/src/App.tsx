import { Route, Routes } from 'react-router-dom';

import './App.scss';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OauthCallbackRouter from './routes/OauthCallbackRouter';
import RankPage from './pages/RankPage';

import { useEffect } from 'react';
import { useAppDispatch } from './app/hooks';
import { checkAuth } from './features/user/userSlice';
import useAuth from './hooks/use-auth';
import WithSocketPage from './pages/WithSocketPage';

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
        <Route path="/rank" element={<RankPage />} />
        <Route path="/oauth/*" element={<OauthCallbackRouter />} />
        <Route path="/*" element={<WithSocketPage />} />
      </Routes>
    </div>
  );
}

export default App;
