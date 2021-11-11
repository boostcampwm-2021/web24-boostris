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
  io.sockets.setMaxListeners(0);
  let roomList = [];

  const lobbyUsers = io.of('/lobby/users');
  const tetris = io.of('/tetris');

  const broadcastRoomList = () => {
    roomList = roomList.filter((r) => r.current !== 0);
    lobbyUsers.emit('room list update', roomList);
  };
  const broadcastUserList = async () => {
    const sockets = (await lobbyUsers.fetchSockets()) as userRemote[];
    lobbyUsers.emit(
      'user list update',
      sockets.filter((s) => s.userName).map((s) => ({ nickname: s.userName, id: s.id }))
    );
  };

  const updateRoomCurrent = (room) => {
    let target = roomList.find((r) => r.id === room);
    if (target) target.current = lobbyUsers.adapter.rooms.get(room).size;
  };

  const broadcastRoomMemberUpdate = async (room, id) => {
    const sockets = (await lobbyUsers.fetchSockets()) as userRemote[];
    if (room !== id && lobbyUsers.adapter.rooms.get(room)) {
      lobbyUsers.to(room).emit(
        'room member list',
        sockets
          .filter((s) => [...lobbyUsers.adapter.rooms.get(room)].includes(s.id))
          .map((s) => ({ nickname: s.userName, id: s.id }))
      );
    }
  };

  lobbyUsers.setMaxListeners(0);
  lobbyUsers.adapter.setMaxListeners(0);

  lobbyUsers.on('connection', (socket: userSocket) => {
    socket.setMaxListeners(0);
    socket.on('set userName', (userName) => {
      socket.userName = userName;
      broadcastUserList();
      broadcastRoomList();
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
        broadcastRoomList();
      } catch (error) {
        lobbyUsers.to(socket.id).emit('create room:fail');
      }
    });

    socket.on('check valid room', ({ roomID, id }) => {
      const target = roomList.find((r) => r.id === roomID);
      if (
        target &&
        target.current < target.limit &&
        lobbyUsers.adapter.rooms.has(roomID) &&
        !lobbyUsers.adapter.rooms.get(roomID).has(id)
      ) {
        socket.join(roomID);
        updateRoomCurrent(roomID);
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
        updateRoomCurrent(roomID);
        lobbyUsers.to(socket.id).emit('join room:success', roomID);
      } catch (error) {
        lobbyUsers.to(socket.id).emit('join room:fail', roomID);
      }
    });

    socket.on('send message', ({ roomID, from, message, id }) => {
      lobbyUsers.to(roomID).emit('receive message', { id, from, message });
    });

    lobbyUsers.adapter.on('join-room', (room, id) => {
      updateRoomCurrent(room);
      broadcastRoomMemberUpdate(room, id);
      broadcastRoomList();
    });
    lobbyUsers.adapter.on('leave-room', (room, id) => {
      updateRoomCurrent(room);
      broadcastRoomMemberUpdate(room, id);
      broadcastRoomList();
    });

    socket.on('disconnecting', () => {
      const roomsWillDelete = [];
      lobbyUsers.adapter.rooms.forEach((value, key) => {
        if (socket.rooms.has(key) && value.size === 1) roomsWillDelete.push(key);
      });
      roomList = roomList.filter(({ id }) => !roomsWillDelete.includes(id));
      broadcastRoomList();
    });

    socket.on('disconnect', async () => {
      broadcastUserList();
    });
  });

  initTetrisSocket(tetris);
};
