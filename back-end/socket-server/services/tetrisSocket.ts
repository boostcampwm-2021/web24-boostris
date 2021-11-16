import { Namespace } from 'socket.io';

import { userSocket } from '../type/socketType';
import { roomList } from '../constant/room';

export const initTetrisSocket = (mainSpace: Namespace, socket: userSocket) => {
  socket.on('get other players info', (res) => {
    const otherPlayer = [...mainSpace.adapter.rooms.get(socket.roomID)].filter((p) => p !== socket.id);
    res(otherPlayer);
  });

  socket.on('game start', (roomID) => {
    // 다른 누군가 게임 시작을 눌렀다면 다른 사용자들에게 알림
    const target = roomList.find((r) => r.id === roomID);
    target.gameStart = true;
    mainSpace.to(roomID).emit('game started');

    target.garbageBlockCnt = [];
    [...mainSpace.adapter.rooms.get(roomID)].forEach((player) => {
      target.garbageBlockCnt.push({id: player, garbageCnt: 0});
    });
  });

  socket.on('drop block', (board, block) => {
    // 내 떨어지는 블록을 다른 사람에게 전송한다.
    socket.broadcast.to(socket.roomID).emit(`other player's drop block`, socket.id, board, block);
  });

  socket.on('attack other player', (garbage) => {
    const target = roomList.find((r) => r.id === socket.id);

    if(target.garbageBlockCnt.length === 1) return; // 한 명 남은 경우 예외 처리

    target.garbageBlockCnt.sort((a, b) => a.garbageCnt - b.garbageCnt);

    let idx = 0;

    if (target.garbageBlockCnt[idx].id === socket.id) {
      // 블록 수가 가장 작은 사람이 자기 자신이라면 다음 사람에게
      idx++;
    }

    mainSpace.to(target.garbageBlockCnt[idx].id).emit('attacked', garbage);

    // 누가 공격 받았는지 전파
    [...mainSpace.adapter.rooms.get(socket.roomID)].forEach(player => {
      if(player === target.garbageBlockCnt[idx].id) return;
      mainSpace.to(player).emit(
        'someone attacked',
        garbage,
        target.garbageBlockCnt[idx].id
      );
    });

    target.garbageBlockCnt[idx].garbageCnt += garbage;
  });

  socket.on('attacked finish', () => {
    socket.broadcast.to(socket.roomID).emit('someone attacked finish', socket.id);
  });

  socket.on('game over', () => {
    // 누군가 게임 오버 시
    const target = roomList.find((r) => r.id === socket.id);

    target.garbageBlockCnt = target.garbageBlockCnt.filter(player => player.id !== socket.id);
    target.gameOverPlayer++;

    if (mainSpace.adapter.rooms.get(socket.roomID).size === 1 || target.gameOverPlayer === mainSpace.adapter.rooms.get(socket.roomID).size - 1) {
      target.gameStart = false;
      // 게임 오버 메시지를 전체 전송(전체 전송은 io로)
      mainSpace.to(socket.roomID).emit('every player game over');
      target.gameOverPlayer = 0;
    }
  });
};
