import { Route, Routes } from 'react-router-dom';
import Tetris from '../../components/Tetris';
import SocketProvider from '../../context/SocketContext';
import RequireAuth from '../../routes/RequireAuth';
import GamePage from '../GamePage';
import LobbyPage from '../LobbyPage';
import RankPage from '../RankPage';

function WithSocketPage() {
  return (
    <SocketProvider>
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
        <Route
          path="/game/:gameID"
          element={
            <RequireAuth>
              <GamePage />
            </RequireAuth>
          }
        />
        <Route path="/rank" element={<RankPage />} />
      </Routes>
    </SocketProvider>
  );
}

export default WithSocketPage;
