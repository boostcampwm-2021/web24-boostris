import {
  broadcastRoomMemberUpdate,
  broadcastRoomList,
  updateRoomCurrent,
  getRooms,
} from './../utils/userUtil';
import { Server } from 'socket.io';

import { initLobbyUserSocket } from './lobbyUserSocket';
import { initTetrisSocket } from './tetrisSocket';
import { userSocket } from '../type/socketType';
import { createAdapter } from '@socket.io/redis-adapter';

import { createClient } from 'redis';
import { promisify } from 'util';
const { Emitter } = require('@socket.io/redis-emitter');
const LOCK = require('redis-lock');

const wrap = (middleware) => (socket, next) => middleware(socket.request, {}, next);

const io = new Server();

export const pubClient = createClient({ host: 'localhost', port: 6379 });

const subClient = pubClient.duplicate();

export const redisEmitter = new Emitter(pubClient);

export const getallAsync = promisify(pubClient.HGETALL).bind(pubClient);
export const hgetAsync = promisify(pubClient.hget).bind(pubClient);
export const getAsync = promisify(pubClient.get).bind(pubClient);
export const asmembers = promisify(pubClient.smembers).bind(pubClient);
export const ahkeys = promisify(pubClient.hkeys).bind(pubClient);
export const lock = promisify(LOCK(pubClient));

export const initSocket = (httpServer, port) => {
  const io = new Server(httpServer, {
    /* options */
    cors: {
      origin: '*',
    },
  });
  io.sockets.setMaxListeners(0);

  io.adapter(createAdapter(pubClient, subClient));

  const mainSpace = io.of('/');

  mainSpace.setMaxListeners(0);
  mainSpace.adapter.setMaxListeners(0);

  mainSpace.on('connection', async (socket: userSocket) => {
    socket.setMaxListeners(0);
    socket.emit('port notify', port);
    initLobbyUserSocket(mainSpace, socket);
    initTetrisSocket(mainSpace, socket);
  });
  mainSpace.adapter.on('create-room', (room) => {});
  mainSpace.adapter.on('join-room', async (room, id) => {
    await updateRoomCurrent(mainSpace, room);
    await broadcastRoomMemberUpdate(mainSpace, room, id);
    await broadcastRoomList(mainSpace);
  });

  mainSpace.adapter.on('leave-room', async (roomID, id) => {
    const roomList = await getRooms(mainSpace);
    const target = roomList.find((r) => r.id === roomID);

    if (target) {
      target.player = target.player.filter((p) => p.id !== id);
      target.gamingPlayer = target.gamingPlayer.filter((p) => p.id !== id);
      target.garbageBlockCnt = target.garbageBlockCnt.filter((p) => p.id !== id);
      target.rank = target.rank.filter((r) => r.id !== id);
      target.current = (await mainSpace.adapter.sockets(new Set([roomID]))).size;
      await pubClient.set(`room:${target.id}`, JSON.stringify(target));
      if (target.gamingPlayer.length === 1) {
        mainSpace.to(roomID).emit('every player game over');
        target.gameStart = false;
        await pubClient.set(`room:${target.id}`, JSON.stringify(target));
      }
    }

    await updateRoomCurrent(mainSpace, roomID);
    await broadcastRoomMemberUpdate(mainSpace, roomID, id);
    await broadcastRoomList(mainSpace);
  });
};
