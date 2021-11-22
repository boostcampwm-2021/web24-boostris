import { Namespace } from 'socket.io';

import { gameOverProcess, initGameInfo, playerAttackProcess, calcPlayerRank } from './../utils/tetrisUtil';
import { userSocket } from '../type/socketType';
import { roomList } from '../constant/room';

export const initTetrisSocket = (mainSpace: Namespace, socket: userSocket) => {
  socket.on('get other players info', (res) => {
    const target = roomList.find((r) => r.id === socket.roomID);

    if (target) {
      const otherPlayer = target.player.filter((p) => p.id !== socket.id);
      res(otherPlayer);
    }
  });

  socket.on('game start', () => {
    const target = roomList.find((r) => r.id === socket.roomID);

    if (target) {
      initGameInfo(mainSpace, socket, target);
    }
  });

  socket.on('drop block', (board, block) => {
    socket.broadcast.to(socket.roomID).emit(`other player's drop block`, socket.id, board, block);
  });

  socket.on('attack other player', (garbage) => {
    const target = roomList.find((r) => r.id === socket.roomID);

    if (target && target.garbageBlockCnt.length !== 1) {
      playerAttackProcess(mainSpace, socket, target, garbage);
    }
  });

  socket.on('attacked finish', () => {
    socket.broadcast.to(socket.roomID).emit('someone attacked finish', socket.id);
  });

  socket.on('game over', () => {
    const target = roomList.find((r) => r.id === socket.roomID);

    if (target) {
      gameOverProcess(mainSpace, socket, target);
    }
  });

  socket.on('get game over info', (data) => {
    const target = roomList.find((r) => r.id === socket.roomID);

    if (target) {
      calcPlayerRank(mainSpace, socket, target, data);
    }
  });
};
