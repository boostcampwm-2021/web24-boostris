import { RemoteSocket, Server, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { authenticateToken } from '../middlewares/jwt';
import { initTetrisSocket } from './tetrisSocket';
import { randomUUID } from 'crypto';

interface userRemote extends RemoteSocket<DefaultEventsMap> {
  userName: string;
}
interface userSocket extends Socket {
  userName: string;
}

const wrap = (middleware) => (socket, next) => middleware(socket.request, {}, next);

export const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    /* options */
    cors: {
      origin: '*',
    },
  });
  let roomList = [];

  const lobbyUsers = io.of('/lobby/users');
  const tetris = io.of('/tetris');

  const braodCastRoomList = () => {
    console.log(lobbyUsers.adapter.rooms);
    roomList = roomList.filter((r) => r.current !== 0);
    lobbyUsers.emit('room list update', roomList);
  };

  lobbyUsers.on('connection', (socket: userSocket) => {
    socket.on('set userName', async (userName) => {
      socket.userName = userName;
      const sockets = (await lobbyUsers.fetchSockets()) as userRemote[];
      lobbyUsers.emit(
        'user list update',
        sockets.filter((s) => s.userName).map((s) => ({ nickname: s.userName, id: s.id }))
      );
      braodCastRoomList();
    });

    socket.on('create room', ({ owner, name, limit, isSecret }) => {
      try {
        let newRoomID = randomUUID();
        socket.join(newRoomID);
        roomList = [
          ...roomList,
          {
            id: newRoomID,
            owner,
            name,
            limit,
            isSecret,
            current: lobbyUsers.adapter.rooms.get(newRoomID).size,
          },
        ];
        lobbyUsers.to(socket.id).emit('create room:success', newRoomID);
        braodCastRoomList();
      } catch (error) {
        lobbyUsers.to(socket.id).emit('create room:fail');
      }
    });

    socket.on('check valid room', ({ roomID, id }) => {
      const target = roomList.find((r) => r.id === roomID);
      console.log(target);
      if (
        target &&
        target.current < target.limit &&
        lobbyUsers.adapter.rooms.has(roomID) &&
        !lobbyUsers.adapter.rooms.get(roomID).has(id)
      ) {
        socket.join(roomID);
        roomList.find((r) => r.id === roomID).current = lobbyUsers.adapter.rooms.get(roomID).size;
        lobbyUsers.to(socket.id).emit('join room:success', roomID);
      } else {
        lobbyUsers.to(socket.id).emit('redirect to lobby');
      }
    });

    socket.on('leave room', (roomID: string) => {
      socket.leave(roomID);
    });
    socket.on('join room', (roomID: string) => {
      try {
        socket.join(roomID);
        roomList.find((r) => r.id === roomID).current = lobbyUsers.adapter.rooms.get(roomID).size;
        lobbyUsers.to(socket.id).emit('join room:success', roomID);
      } catch (error) {
        lobbyUsers.to(socket.id).emit('join room:fail', roomID);
      }
    });
    lobbyUsers.adapter.on('join-room', (room, id) => {
      let target = roomList.find((r) => r.id === room);
      if (target) target.current = lobbyUsers.adapter.rooms.get(room).size;
      braodCastRoomList();
    });
    lobbyUsers.adapter.on('leave-room', (room, id) => {
      let target = roomList.find((r) => r.id === room);
      if (target) target.current = lobbyUsers.adapter.rooms.get(room).size;
      braodCastRoomList();
    });

    socket.on('disconnecting', () => {
      const roomsWillDelete = [];
      lobbyUsers.adapter.rooms.forEach((value, key) => {
        if (socket.rooms.has(key) && value.size === 1) roomsWillDelete.push(key);
      });
      roomList = roomList.filter(({ id }) => !roomsWillDelete.includes(id));
      braodCastRoomList();
    });

    socket.on('disconnect', async () => {
      const sockets = (await lobbyUsers.fetchSockets()) as userRemote[];
      lobbyUsers.emit(
        'user list update',
        sockets.map((s) => ({ nickname: s.userName, id: s.id }))
      );
    });
  });

  initTetrisSocket(tetris);
};
