
import { RemoteSocket, Server, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { authenticateToken } from '../middlewares/jwt';
import { initTetrisSocket } from './tetrisSocket';

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
  const lobbyUsers = io.of('/lobby/users');
  const tetris = io.of('/tetris');
  
  lobbyUsers.on('connection', (socket: userSocket) => {
    socket.on('set userName', async (userName) => {
      socket.userName = userName;
      const sockets = (await lobbyUsers.fetchSockets()) as userRemote[];
      lobbyUsers.emit(
        'user list update',
        sockets.map((s) => ({ nickname: s.userName, id: s.id }))
      );
    });

    socket.on('user', (user) => {});

    socket.on('chat', (msg) => {});

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
