import { nanoid } from '@reduxjs/toolkit';
import { useRef, createContext, useEffect, useContext, useState, SetStateAction } from 'react';
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
  updateLobbyMessages,
  userInfo,
} from '../features/socket/socketSlice';
import useAuth from '../hooks/use-auth';

type SocketStateType = {
  isReady: boolean;
  isValidRoom: boolean;
  isStartedGame: boolean;
  setIsStartedGame: React.Dispatch<SetStateAction<boolean>>;
};

const SocketContext = createContext<any>(null);
const SocketReadyContext = createContext<SocketStateType>({
  isReady: false,
  isValidRoom: false,
  isStartedGame: false,
  setIsStartedGame: () => {},
});

function SocketProvider({ children }: { children: React.ReactNode }) {
  const socketRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [isValidRoom, setIsValidRoom] = useState(false);
  const [isStartedGame, setIsStartedGame] = useState(false);
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
        socketRef.current.emit('set userName', profile.nickname, profile.id);
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
        setIsStartedGame(isStartedGame);
        setIsValidRoom(true);
        dispatch(updateRoomID(roomID));
        navigate(`/game/${roomID}`);
      });
      socketRef.current.on('refresh friend list', () => {
        dispatch(getFriendList({ oauthID: profile.id as string }));
      });
      socketRef.current.on('refresh request list', () => {
        dispatch(getRequestList({ requestee: profile.id as string }));
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

      socketRef.current.on(
        'receive lobby message',
        ({ from, message, id }: { from: string; message: string; id: string }) => {
          dispatch(updateLobbyMessages({ from, message, id }));
        }
      );
    }
    return () => {
      (socketRef.current as Socket).close();
    };
  }, [auth.authenticated, profile.nickname]);

  return (
    <SocketContext.Provider value={socketRef}>
      <SocketReadyContext.Provider
        value={{ isReady, isValidRoom, isStartedGame, setIsStartedGame }}
      >
        {children}
      </SocketReadyContext.Provider>
    </SocketContext.Provider>
  );
}
export const useSocket = () => useContext(SocketContext);
export const useSocketReady = () => useContext(SocketReadyContext);
export default SocketProvider;
