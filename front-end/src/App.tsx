import { BrowserRouter, Route, Routes } from 'react-router-dom';

import './App.scss';
import LobbyPage from './pages/LobbyPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Tetris from './components/Tetris';
// import Login from './components/login';
import OauthCallbackRouter from './routes/OauthCallbackRouter';
import RequireAuth from './routes/RequireAuth';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <RequireAuth>
                <LobbyPage />
              </RequireAuth>
            }
          />
          <Route
            path="/tetris"
            element={
              <RequireAuth>
                <Tetris />
              </RequireAuth>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/oauth/*" element={<OauthCallbackRouter />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
