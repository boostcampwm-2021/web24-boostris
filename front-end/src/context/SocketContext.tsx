import { useRef, createContext, useEffect, MutableRefObject, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { useAppDispatch } from '../app/hooks';
import {
  roomInfo,
  updateRoomID,
  updateRoomMembers,
  updateRoomMessages,
  updateRooms,
  updateUsers,
  userInfo,
} from '../features/socket/socketSlice';
import useAuth from '../hooks/use-auth';

const SocketContext = createContext<any>(null);
const SocketReadyContext = createContext<boolean>(false);

function SocketProvider({ children }: { children: React.ReactNode }) {
  const socketRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const { profile, auth } = useAuth();

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    if (auth.authenticated) {
      socketRef.current = io('/lobby/users', {
        transports: ['websocket'],
        path: '/socket.io',
      });
      socketRef.current.on('connect', () => {
        setIsReady(true);
        socketRef.current.emit('set userName', profile.nickname);
      });

      socketRef.current.on('user list update', (list: userInfo[]) => {
        dispatch(updateUsers(list));
      });
      socketRef.current.on('room list update', (list: roomInfo[]) => {
        dispatch(updateRooms(list));
      });
      socketRef.current.on('create room:success', (roomID: string) => {
        dispatch(updateRoomID(roomID));
        navigate(`/game/${roomID}`);
      });
      socketRef.current.on('join room:success', (roomID: string) => {
        dispatch(updateRoomID(roomID));
        navigate(`/game/${roomID}`);
      });
      socketRef.current.on('leave room:success', () => {});
      socketRef.current.on('redirect to lobby', () => {
        dispatch(updateRoomID(null));
        navigate(`/`);
      });
      socketRef.current.on('room member list', (list: string[]) => {
        dispatch(updateRoomMembers(list));
      });

      socketRef.current.on(
        'receive message',
        ({ from, message, id }: { from: string; message: string; id: string }) => {
          dispatch(updateRoomMessages({ from, message, id }));
        }
      );
    }
    return () => {
      if (socketRef.current && !auth.authenticated) {
        (socketRef.current as Socket).close();
      }
    };
  }, [auth.authenticated]);

  return (
    <SocketContext.Provider value={socketRef}>
      <SocketReadyContext.Provider value={isReady}>{children}</SocketReadyContext.Provider>
    </SocketContext.Provider>
  );
}
export const useSocket = () => useContext(SocketContext);
export const useSocketReady = () => useContext(SocketReadyContext);
export default SocketProvider;
