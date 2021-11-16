import { Namespace } from 'socket.io';
import { randomUUID } from 'crypto';

import { userSocket } from '../type/socketType';
import { roomList, setRoomList } from '../constant/room';
import { broadcastUserList, broadcastRoomList, updateRoomCurrent, broadcastRoomMemberUpdate } from '../utils/userUtil';

export const initLobbyUserSocket = (mainSpace: Namespace, socket: userSocket) => {
  socket.on('set userName', (userName) => {
    socket.userName = userName;
    
    broadcastUserList(mainSpace);
    broadcastRoomList(mainSpace);
  });

  socket.on('create room', ({ owner, name, limit, isSecret }) => {
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
          player: [socket.id]
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
      socket.join(roomID);
      mainSpace.to(socket.id).emit('join room:success', roomID);

      updateRoomCurrent(mainSpace, roomID);
    } else {
      mainSpace.to(socket.id).emit('redirect to lobby');
    }
  });

  socket.on('leave room', (roomID: string) => {
    const target = roomList.find((r) => r.id === roomID);
    target.player = target.player.filter((p) => p !== socket.id);
    socket.leave(roomID);
  });

  socket.on('join room', (roomID: string) => {
    const target = roomList.find((r) => r.id === roomID);

    try {
      if(target.gameStart) {
        mainSpace.to(socket.id).emit('already started');
        socket.disconnect();
        return;
      }

      target.player.push(socket.id);
      
      socket.roomID = roomID;
      socket.join(roomID);
      
      updateRoomCurrent(mainSpace, roomID);

      mainSpace.to(socket.id).emit('join room:success', roomID);
      socket.broadcast.to(roomID).emit('enter new player', socket.id);
    } catch (error) {
      mainSpace.to(socket.id).emit('join room:fail', roomID);
    }
  });

  socket.on('send message', ({ roomID, from, message, id }) => {
    mainSpace.to(roomID).emit('receive message', { id, from, message });
  });

  mainSpace.adapter.on('join-room', (room, id) => {
    updateRoomCurrent(mainSpace, room);
    broadcastRoomMemberUpdate(mainSpace, room, id);
    broadcastRoomList(mainSpace);
  });

  mainSpace.adapter.on('leave-room', (room, id) => {
    updateRoomCurrent(mainSpace, room);
    broadcastRoomMemberUpdate(mainSpace, room, id);
    broadcastRoomList(mainSpace);
  });

  socket.on('disconnecting', () => {
    const roomsWillDelete = [];
    mainSpace.adapter.rooms.forEach((value, key) => {
      if (socket.rooms.has(key) && value.size === 1) roomsWillDelete.push(key);
    });
    setRoomList(roomList.filter(({ id }) => !roomsWillDelete.includes(id)));
    broadcastRoomList(mainSpace);
  });

  socket.on('disconnect', async () => {
    // 게임 종료 시 다른 사람들한테 전달
    socket.broadcast.to(socket.roomID).emit('disconnect player', socket.id);

    broadcastUserList(mainSpace);
  });
}