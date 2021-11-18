import { nanoid } from '@reduxjs/toolkit';
import { useRef, createContext, useEffect, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { useAppDispatch } from '../app/hooks';
import { getFriendList, getRequestList } from '../features/friend/friendSlice';
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

type SocketStateType = {
  isReady: boolean;
  isValidRoom: boolean;
};

const SocketContext = createContext<any>(null);
const SocketReadyContext = createContext<SocketStateType>({
  isReady: false,
  isValidRoom: false,
});

function SocketProvider({ children }: { children: React.ReactNode }) {
  const socketRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [isValidRoom, setIsValidRoom] = useState(false);
  const { profile, auth } = useAuth();

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    if (auth.authenticated) {
      socketRef.current = io('/', {
        transports: ['websocket'],
        path: '/socket.io',
        secure: true,
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
        setIsValidRoom(true);
        dispatch(updateRoomID(roomID));
        navigate(`/game/${roomID}`);
      });
      socketRef.current.on('join room:success', (roomID: string, isStartedGame: boolean) => {
        socketRef.current.emit('send message', {
          roomID,
          from: 'socket-server',
          message: `${profile.nickname}님이 입장하셨습니다.`,
          id: nanoid(),
        });
        setIsValidRoom(true);
        dispatch(updateRoomID(roomID));
        navigate(`/game/${roomID}`);
      });
      socketRef.current.on('refresh friend list', () => {
        dispatch(getFriendList({ nickname: profile.nickname as string }));
      });
      socketRef.current.on('refresh request list', () => {
        dispatch(getRequestList({ requestee: profile.nickname as string }));
      });
      socketRef.current.on('leave room:success', () => {});
      socketRef.current.on('redirect to lobby', () => {
        setIsValidRoom(false);
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
      <SocketReadyContext.Provider value={{ isReady, isValidRoom }}>
        {children}
      </SocketReadyContext.Provider>
    </SocketContext.Provider>
  );
}
export const useSocket = () => useContext(SocketContext);
export const useSocketReady = () => useContext(SocketReadyContext);
export default SocketProvider;
