import { Server } from 'socket.io';
import { authenticateToken } from '../middlewares/jwt';

const wrap = (middleware) => (socket, next) => middleware(socket.request, {}, next);

export const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    /* options */
    cors: {
      origin: '*',
    },
  });
  const lobbyUsers = io.of('/lobby/users');

  lobbyUsers.on('connection', (socket) => {
    console.log(socket.id);

    lobbyUsers.allSockets().then((s) => console.log(s));

    console.log('asdf');
    socket.on('playerMove', (player) => {});

    socket.on('user', (user) => {});

    socket.on('chat', (msg) => {});

    socket.on('disconnect', () => {});
  });
};
