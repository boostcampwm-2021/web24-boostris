import {
  broadcastRoomMemberUpdate,
  broadcastRoomList,
  updateRoomCurrent,
} from './../utils/userUtil';
import { Server } from 'socket.io';

import { initLobbyUserSocket } from './lobbyUserSocket';
import { initTetrisSocket } from './tetrisSocket';
import { userSocket } from '../type/socketType';
import { roomList } from '../constant/room';

const wrap = (middleware) => (socket, next) => middleware(socket.request, {}, next);

export const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    /* options */
    cors: {
      origin: '*',
    },
  });
  io.sockets.setMaxListeners(0);

  const mainSpace = io.of('/');

  mainSpace.setMaxListeners(0);
  mainSpace.adapter.setMaxListeners(0);

  mainSpace.on('connection', (socket: userSocket) => {
    socket.setMaxListeners(0);

    initLobbyUserSocket(mainSpace, socket);
    initTetrisSocket(mainSpace, socket);
  });
  mainSpace.adapter.on('join-room', (room, id) => {
    updateRoomCurrent(mainSpace, room);
    broadcastRoomMemberUpdate(mainSpace, room, id);
    broadcastRoomList(mainSpace);
  });

  mainSpace.adapter.on('leave-room', (roomID, id) => {
    const target = roomList.find((r) => r.id === roomID);

    if(target) {
      target.player = target.player.filter((p) => p.id !== id);
      target.gamingPlayer = target.gamingPlayer.filter((p) => p.id !== id);
      target.garbageBlockCnt = target.garbageBlockCnt.filter((p) => p.id !== id);
      target.rank = target.rank.filter((r) => r.id !== id);
      
      if(target.gamingPlayer.length === 1) {
        mainSpace.to(roomID).emit('every player game over');
        target.gameStart = false;
      }
    }

    updateRoomCurrent(mainSpace, roomID);
    broadcastRoomMemberUpdate(mainSpace, roomID, id);
    broadcastRoomList(mainSpace);
  });
};
