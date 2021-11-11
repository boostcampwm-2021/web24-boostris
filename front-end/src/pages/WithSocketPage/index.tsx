import { Outlet } from 'react-router-dom';
import SocketProvider from '../../context/SocketContext';

function WithSocketPage() {
  return (
    <SocketProvider>
      <Outlet />
    </SocketProvider>
  );
}

export default WithSocketPage;
