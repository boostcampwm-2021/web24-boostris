import { Namespace } from 'socket.io';

import { roomList, setRoomList } from '../constant/room';
import { userRemote } from '../type/socketType';

export const broadcastRoomList = (mainSpace: Namespace) => {
  setRoomList(roomList.filter((r) => r.current !== 0));
  mainSpace.emit('room list update', roomList);
};

export const broadcastUserList = async (mainSpace: Namespace) => {
  const sockets = (await mainSpace.fetchSockets()) as userRemote[];
  mainSpace.emit(
    'user list update',
    sockets
      .filter((s) => s.userName)
      .map((s) => ({ nickname: s.userName, id: s.id, oauthID: s.oauthID }))
  );
};

export const updateRoomCurrent = (mainSpace: Namespace, room) => {
  let target = roomList.find((r) => r.id === room);
  if (target) target.current = mainSpace.adapter.rooms.get(room).size;
};

export const broadcastRoomMemberUpdate = async (mainSpace: Namespace, room, id) => {
  const sockets = (await mainSpace.fetchSockets()) as userRemote[];
  if (room !== id && mainSpace.adapter.rooms.get(room)) {
    mainSpace.to(room).emit(
      'room member list',
      sockets
        .filter((s) => [...mainSpace.adapter.rooms.get(room)].includes(s.id))
        .map((s) => ({ nickname: s.userName, id: s.id, oauthID: s.oauthID }))
    );
  }
};
