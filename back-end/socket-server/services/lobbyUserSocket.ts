import { getSockets } from './../utils/userUtil';
import { Namespace } from 'socket.io';
import { randomUUID } from 'crypto';

import { userRemote, userSocket } from '../type/socketType';
import {
  broadcastUserList,
  broadcastRoomList,
  updateRoomCurrent,
  getRooms,
} from '../utils/userUtil';
import { pubClient } from './socket';
import { RedisAdapter } from '@socket.io/redis-adapter';

export const initLobbyUserSocket = (mainSpace: Namespace, socket: userSocket) => {
  socket.on('duplicate check', async (oauthID) => {
    const sockets = (await mainSpace.fetchSockets()) as userRemote[];
    if (sockets.filter((s) => s.oauthID === oauthID).length >= 1) {
      mainSpace.to(socket.id).emit('duplicate check:fail');
      socket.disconnect();
    } else {
      mainSpace.emit('duplicate check:success');
    }
  });

  socket.on('set userName', async (userName, oauthID) => {
    await pubClient.SADD('sid', socket.id);
    await pubClient.HSET(`user:${socket.id}`, 'userName', userName, 'oauthID', oauthID);

    socket.userName = userName;
    socket.oauthID = oauthID;
    broadcastUserList(mainSpace);
    broadcastRoomList(mainSpace);
  });

  socket.on('create room', ({ owner, name, limit, isSecret, nickname }) => {
    try {
      let newRoomID = randomUUID();
      socket.roomID = newRoomID;
      socket.join(newRoomID);
      pubClient.set(
        `room:${newRoomID}`,
        JSON.stringify({
          id: newRoomID,
          owner,
          name,
          limit,
          isSecret,
          current: mainSpace.adapter.rooms.get(newRoomID).size,
          gameOverPlayer: 0,
          garbageBlockCnt: [],
          gameStart: false,
          player: [{ id: socket.id, nickname: nickname }],
          gamingPlayer: [],
          rank: [],
          semaphore: 0,
        })
      );

      mainSpace.to(socket.id).emit('create room:success', newRoomID);

      broadcastRoomList(mainSpace);
    } catch (error) {
      mainSpace.to(socket.id).emit('create room:fail');
    }
  });

  socket.on('check valid room', async ({ roomID, id }) => {
    const roomList = await getRooms(mainSpace);
    const target = roomList.find((r) => r.id === roomID);
    const redisAdapter = mainSpace.adapter as RedisAdapter;
    if (
      target &&
      target.current < target.limit &&
      (await redisAdapter.allRooms()).has(roomID) &&
      !redisAdapter.rooms.get(roomID).has(id)
    ) {
      try {
        const isPlayer = target.player.find((p) => p.id === socket.id);

        if (!isPlayer) {
          target.player.push({ id: socket.id, nickname: socket.userName });
          pubClient.set(`room:${target.id}`, JSON.stringify(target));
          socket.roomID = roomID;
          socket.join(roomID);

          updateRoomCurrent(mainSpace, roomID);

          mainSpace.to(socket.id).emit('join room:success', roomID, target.gameStart);
          socket.broadcast.to(roomID).emit('enter new player', socket.id, socket.userName);
        }
      } catch (error) {
        mainSpace.to(socket.id).emit('join room:fail', roomID);
      }
    } else {
      mainSpace.to(socket.id).emit('redirect to lobby');
    }
  });

  socket.on('leave room', async (roomID: string) => {
    const roomList = await getRooms(mainSpace);
    const target = roomList.find((r) => r.id === roomID);

    if (target) {
      target.player = target.player.filter((p) => p.id !== socket.id);
      target.gamingPlayer = target.gamingPlayer.filter((p) => p.id !== socket.id);
      target.garbageBlockCnt = target.garbageBlockCnt.filter((p) => p.id !== socket.id);
      target.rank = target.rank.filter((r) => r.nickname !== socket.userName);
      pubClient.set(`room:${target.id}`, JSON.stringify(target));

      if (target.gamingPlayer.length === 1) {
        mainSpace.to(roomID).emit('every player game over');
        target.gameStart = false;
        pubClient.set(`room:${target.id}`, JSON.stringify(target));
      }

      socket.broadcast.to(socket.roomID).emit('leave player', socket.id);
      socket.leave(roomID);
      broadcastRoomList(mainSpace);
    }
  });

  socket.on('join room', async (roomID: string, nickname) => {
    const roomList = await getRooms(mainSpace);
    const target = roomList.find((r) => r.id === roomID);

    try {
      const isPlayer = target.player.find((p) => p.id === socket.id);

      if (!isPlayer) {
        target.player.push({ id: socket.id, nickname: nickname });

        socket.roomID = roomID;
        socket.join(roomID);
        pubClient.set(`room:${target.id}`, JSON.stringify(target));
        updateRoomCurrent(mainSpace, roomID);

        mainSpace.to(socket.id).emit('join room:success', roomID, target.gameStart);
        socket.broadcast.to(roomID).emit('enter new player', socket.id, nickname);
      }
    } catch (error) {
      mainSpace.to(socket.id).emit('join room:fail', roomID);
    }
  });

  socket.on('send message', ({ roomID, from, message, id }) => {
    mainSpace.to(roomID).emit('receive message', { id, from, message });
  });

  socket.on('send lobby message', ({ from, message, id }) => {
    mainSpace.emit('receive lobby message', { id, from, message });
  });

  socket.on('refresh friend list', async (oauthID) => {
    const sockets = await getSockets(mainSpace);
    const target = sockets.find((s) => s.oauthID === oauthID);
    if (target) {
      mainSpace.to(target.id).emit('refresh friend list');
    }
  });

  socket.on('refresh request list', (socketId) => {
    mainSpace.to(socketId).emit('refresh request list');
  });

  socket.on('disconnecting', async () => {
    await pubClient.HDEL(`user:${socket.id}`, 'userName', 'oauthID');
    const roomList = await getRooms(mainSpace);
    const target = roomList.find((r) => r.id === socket.roomID);

    if (target) {
      target.player = target.player.filter((p) => p.id !== socket.id);
      socket.broadcast.to(socket.roomID).emit('leave player', socket.id);
      pubClient.set(`room:${target.id}`, JSON.stringify(target));

      if (target.player.length === 1) {
        mainSpace.to(socket.roomID).emit('every player game over');
        target.gameStart = false;
        pubClient.set(`room:${target.id}`, JSON.stringify(target));
      }
    }

    const roomsWillDelete = [];
    const redisAdapter = mainSpace.adapter as RedisAdapter;
    [...(await redisAdapter.allRooms())].forEach((rId) => {
      if (socket.rooms.has(rId) && redisAdapter.rooms.get(rId).size === 1)
        roomsWillDelete.push(rId);
    });
    roomsWillDelete.forEach((rID) => {
      pubClient.del(`room:${rID}`);
    });
    broadcastRoomList(mainSpace);
  });

  socket.on('disconnect', async () => {
    broadcastUserList(mainSpace);
  });
};
