import { RedisAdapter } from '@socket.io/redis-adapter';
import { getallAsync, getAsync, asmembers, pubClient } from './../services/socket';
import { Namespace } from 'socket.io';

import { userRemote } from '../type/socketType';

export const getRooms = async (mainSpace: Namespace) => {
  const sockeList = await mainSpace.adapter.sockets(new Set());
  const redisAdapter = mainSpace.adapter as RedisAdapter;
  const roomIDs = [...(await redisAdapter.allRooms())].filter((r) => !sockeList.has(r));
  const roomList = [];
  await Promise.all(
    roomIDs.map(async (roomId) => {
      const data = await getAsync(`room:${roomId}`);
      if (data) {
        const roomInfo = JSON.parse(data);
        if (roomInfo.current !== 0) {
          roomList.push(roomInfo);
        }
      }
      return data;
    })
  );

  return roomList;
};

export const getSockets = async (mainSpace: Namespace) => {
  const sids = [...(await mainSpace.adapter.sockets(new Set()))];

  const sockets = [];
  await Promise.all(
    sids.map(async (sid) => {
      const data = await getallAsync(`user:${sid}`);
      if (data) {
        sockets.push({ ...data, id: sid, nickname: data.userName });
      }
      return data;
    })
  );

  return sockets;
};

export const broadcastRoomList = async (mainSpace: Namespace) => {
  const roomList = await getRooms(mainSpace);
  mainSpace.emit('room list update', roomList);
};

export const broadcastUserList = async (mainSpace: Namespace) => {
  const sockets = await getSockets(mainSpace);
  mainSpace.emit(
    'user list update',
    sockets.filter((s) => s.userName)
  );
};

export const updateRoomCurrent = async (mainSpace: Namespace, room) => {
  const roomList = await getRooms(mainSpace);
  let target = roomList.find((r) => r.id === room);
  if (target) {
    target.current = (await mainSpace.adapter.sockets(new Set([room]))).size;
    await pubClient.set(`room:${target.id}`, JSON.stringify(target));
  }
};

export const broadcastRoomMemberUpdate = async (mainSpace: Namespace, room, id) => {
  const sockets = await getSockets(mainSpace);
  const redisAdapter = mainSpace.adapter as RedisAdapter;
  const targetSockets = await mainSpace.adapter.sockets(new Set([room]));
  if (room !== id && targetSockets.size) {
    const socketsInRoom = [...targetSockets].map((sid) => sockets.find((s) => s.id === sid));

    mainSpace.to(room).emit(
      'room member list',
      socketsInRoom.map((s) => ({ nickname: s.userName, id: s.id, oauthID: s.oauthID }))
    );
  }
};
