import { Namespace } from 'socket.io';
import { randomUUID } from 'crypto';

import { userRemote, userSocket } from '../type/socketType';
import { roomList, setRoomList } from '../constant/room';
import {
  broadcastUserList,
  broadcastRoomList,
  updateRoomCurrent,
  broadcastRoomMemberUpdate,
} from '../utils/userUtil';

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
      const rooms = [
        ...roomList,
        {
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
        },
      ];

      mainSpace.to(socket.id).emit('create room:success', newRoomID);

      setRoomList(rooms);
      broadcastRoomList(mainSpace);
    } catch (error) {
      mainSpace.to(socket.id).emit('create room:fail');
    }
  });

  socket.on('check valid room', ({ roomID, id }) => {
    const target = roomList.find((r) => r.id === roomID);
    if (
      target &&
      target.current < target.limit &&
      mainSpace.adapter.rooms.has(roomID) &&
      !mainSpace.adapter.rooms.get(roomID).has(id)
    ) {
      try {
        const isPlayer = target.player.find((p) => p.id === socket.id);

        if (!isPlayer) {
          target.player.push({ id: socket.id, nickname: socket.userName });

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

  socket.on('leave room', (roomID: string) => {
    const target = roomList.find((r) => r.id === roomID);

    if (target) {
      target.player = target.player.filter((p) => p.id !== socket.id);
      target.gamingPlayer = target.gamingPlayer.filter((p) => p.id !== socket.id);
      target.garbageBlockCnt = target.garbageBlockCnt.filter((p) => p.id !== socket.id);
      target.rank = target.rank.filter((r) => r.nickname !== socket.userName);

      if (target.gamingPlayer.length === 1) {
        mainSpace.to(roomID).emit('every player game over');
        target.gameStart = false;
      }

      socket.broadcast.to(socket.roomID).emit('leave player', socket.id);
      socket.leave(roomID);
    }
  });

  socket.on('join room', (roomID: string, nickname) => {
    const target = roomList.find((r) => r.id === roomID);

    try {
      const isPlayer = target.player.find((p) => p.id === socket.id);

      if (!isPlayer) {
        target.player.push({ id: socket.id, nickname: nickname });

        socket.roomID = roomID;
        socket.join(roomID);

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
    const sockets = (await mainSpace.fetchSockets()) as userRemote[];
    const target = sockets.find((s) => s.oauthID === oauthID);
    if (target) {
      mainSpace.to(target.id).emit('refresh friend list');
    }
  });

  socket.on('refresh request list', (socketId) => {
    mainSpace.to(socketId).emit('refresh request list');
  });

  socket.on('disconnecting', () => {
    const target = roomList.find((r) => r.id === socket.roomID);

    if (target) {
      target.player = target.player.filter((p) => p.id !== socket.id);
      socket.broadcast.to(socket.roomID).emit('leave player', socket.id);

      if (target.player.length === 1) {
        mainSpace.to(socket.roomID).emit('every player game over');
        target.gameStart = false;
      }
    }

    const roomsWillDelete = [];
    mainSpace.adapter.rooms.forEach((value, key) => {
      if (socket.rooms.has(key) && value.size === 1) roomsWillDelete.push(key);
    });
    setRoomList(roomList.filter(({ id }) => !roomsWillDelete.includes(id)));
    broadcastRoomList(mainSpace);
  });

  socket.on('disconnect', async () => {
    broadcastUserList(mainSpace);
  });
};
