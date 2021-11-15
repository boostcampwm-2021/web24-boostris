import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { Namespace, Socket, RemoteSocket } from 'socket.io';

interface tetrisSocketRemote extends RemoteSocket<DefaultEventsMap> {
  roomId: string;
}
interface tetrisSocket extends Socket {
  roomId: string;
}

export const initTetrisSocket = (io: Namespace) => {
  const initialState = {
    gameOverPlayer: 0,
    garbageBlockCnt: [],
    game: false
  };

  const rooms = {};

  io.on('connection', (socket: tetrisSocket) => {
    socket.on('join room', (roomId) => {
      if (!rooms.hasOwnProperty(roomId)) {
        rooms[roomId] = JSON.parse(JSON.stringify({ ...initialState }));
      }
      console.log(rooms);
      // else {
      //   // if(!rooms[roomId].game) {
      //   //   socket.join(roomId);
      //   //   socket.roomId = roomId;
      //   //   socket.broadcast.to(roomId).emit('enter new player', socket.id);
      //   // }
      //   // else {
      //   //   io.to(socket.id).emit('already started');
      //   // }
      // }

      if(rooms[roomId].game) {
        io.to(socket.id).emit('already started');
        socket.disconnect();
        return;
      }

      socket.join(roomId);
      socket.roomId = roomId;
      socket.broadcast.to(roomId).emit('enter new player', socket.id);
    });

    socket.on('get other players info', (res) => {
      const otherPlayer = [...io.adapter.rooms.get(socket.roomId)].filter((p) => p !== socket.id);
      res(otherPlayer);
    });

    socket.on('game start', () => {
      // 다른 누군가 게임 시작을 눌렀다면 다른 사용자들에게 알림
      rooms[socket.roomId].game = true;
      io.to(socket.roomId).emit('game started');
      rooms[socket.roomId].garbageBlockCnt = []; // 공격 전달을 위한 배열 초기화
      [...io.adapter.rooms.get(socket.roomId)].forEach((player) =>
        rooms[socket.roomId].garbageBlockCnt.push({ id: player, garbageCnt: 0 })
      );
    });

    socket.on('drop block', (board, block) => {
      // 내 떨어지는 블록을 다른 사람에게 전송한다.
      socket.broadcast.to(socket.roomId).emit(`other player's drop block`, socket.id, board, block);
    });

    socket.on('attack other player', (garbage) => {
      if(rooms[socket.roomId].garbageBlockCnt.length === 1) return; // 한 명 남은 경우 예외 처리

      rooms[socket.roomId].garbageBlockCnt.sort((a, b) => a.garbageCnt - b.garbageCnt);

      let idx = 0;

      if (rooms[socket.roomId].garbageBlockCnt[idx].id === socket.id) {
        // 블록 수가 가장 작은 사람이 자기 자신이라면 다음 사람에게
        idx++;
      }

      io.to(rooms[socket.roomId].garbageBlockCnt[idx].id).emit('attacked', garbage);

      // 누가 공격 받았는지 전파
      [...io.adapter.rooms.get(socket.roomId)].forEach(player => {
        if(player === rooms[socket.roomId].garbageBlockCnt[idx].id) return;
        io.to(player).emit(
          'someone attacked',
          garbage,
          rooms[socket.roomId].garbageBlockCnt[idx].id
        );
      });

      rooms[socket.roomId].garbageBlockCnt[idx].garbageCnt += garbage;
    });

    socket.on('attacked finish', () => {
      socket.broadcast.to(socket.roomId).emit('someone attacked finish', socket.id);
    });

    socket.on('game over', () => {
      // 누군가 게임 오버 시
      rooms[socket.roomId].garbageBlockCnt = rooms[socket.roomId].garbageBlockCnt.filter(player => player.id !== socket.id);

      rooms[socket.roomId].gameOverPlayer++;

      if (io.adapter.rooms.get(socket.roomId).size === 1 || rooms[socket.roomId].gameOverPlayer === io.adapter.rooms.get(socket.roomId).size - 1) {
        rooms[socket.roomId].game = false;
        // 게임 오버 메시지를 전체 전송(전체 전송은 io로)
        io.to(socket.roomId).emit('every player game over');
        rooms[socket.roomId].gameOverPlayer = 0;
      }
    });

    socket.on('disconnect', () => {
      // 게임 종료 시 다른 사람들한테 전달
      socket.broadcast.to(socket.roomId).emit('disconnect player', socket.id);
    });
  });

  io.on('delete room', (deleteRoomList) => {
    deleteRoomList.forEach((id) => {
      delete rooms[id];
    });
  });
};
