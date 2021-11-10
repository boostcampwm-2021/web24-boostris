import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { useSocket, useSocketReady } from '../../context/SocketContext';
import { selectSocket } from '../../features/socket/socketSlice';
import AppbarLayout from '../../layout/AppbarLayout';

function GamePage() {
  const { gameID } = useParams();
  const { roomID } = useAppSelector(selectSocket);
  const socketClient = useSocket();
  const isReady = useSocketReady();

  useEffect(() => {
    const ref = socketClient.current;
    return () => {
      if (ref) {
        ref.emit('leave room', roomID);
      }
    };
  }, [roomID, socketClient]);

  useEffect(() => {
    if (isReady && socketClient.current) {
      if (!roomID) {
        socketClient.current.emit('check valid room', { roomID: gameID, id: socketClient.id });
      }
    }
  }, [isReady, gameID, socketClient, roomID]);

  return (
    <AppbarLayout>
      <div>Game# {gameID}</div>
    </AppbarLayout>
  );
}

export default GamePage;
