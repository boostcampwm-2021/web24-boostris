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
  };

  const rooms = {};

  io.on('connection', (socket: tetrisSocket) => {
    console.log(`socket ${socket.id} connect`);

    // socket.join(room);
    // online[socket.id] = { room: room };
    // rooms[room].players.push(socket.id);

    socket.on('join room', (roomId) => {
      // 방 ID 를 고유하게 만들어서 join할 예정
      // online[socket.id] = {room: roomId};
      if (!rooms.hasOwnProperty(roomId)) {
        rooms[roomId] = JSON.parse(JSON.stringify({ ...initialState }));
      }
      socket.join(roomId);
      socket.roomId = roomId;

      //socket.broadcast.to(roomId).emit('join new player', socket.id);
      //socket.emit('get other players info', rooms[roomId].players); // 누군가 방에 들어오면 자신을 제외한 모든 사람들 전송

      // rooms[roomId].players.push(socket.id);

      //if(!rooms[roomId].players) return;
      // console.log(online);
      // console.log(rooms);
      socket.broadcast.to(roomId).emit('enter new player', socket.id);
    });

    socket.on('get other players info', (res) => {
      // const [roomID] = [...io.adapter.sids.get(socket.id)].filter((r) => r !== socket.id);
      const otherPlayer = [...io.adapter.rooms.get(socket.roomId)].filter((p) => p !== socket.id);
      //  rooms[room].players.filter((player) => player != socket.id);
      res(otherPlayer);
    });

    socket.on('game start', () => {
      // 다른 누군가 게임 시작을 눌렀다면 다른 사용자들에게 알림
      io.to(socket.roomId).emit('game started');

      [...io.adapter.rooms.get(socket.roomId)].forEach((player) =>
        rooms[socket.roomId].garbageBlockCnt.push({ id: player, live: true, garbageCnt: 0 })
      );
    });

    socket.on('drop block', (board, block) => {
      // 내 떨어지는 블록을 다른 사람에게 전송한다.
      socket.broadcast.to(socket.roomId).emit(`other player's drop block`, socket.id, board, block);
    });

    socket.on('attack other player', (garbage) => {
      rooms[socket.roomId].garbageBlockCnt.sort((a, b) => a.garbageCnt - b.garbageCnt);

      let idx = 0;

      while (true) {
        if (rooms[socket.roomId].garbageBlockCnt[idx].live) {
          break;
        }
        idx = (idx + 1) % rooms[socket.roomId].garbageBlockCnt.length;
      }

      if (rooms[socket.roomId].garbageBlockCnt[idx]?.id === socket.id) {
        // 블록 수가 가장 작은 사람이 자기 자신이라면 다음 사람에게
        idx++;
      }

      for (let i = 0; i < rooms[socket.roomId].garbageBlockCnt.length; i++) {
        if (i === idx) {
          // 공격 받는 플레이어
          io.to(rooms[socket.roomId].garbageBlockCnt[i]?.id).emit('attacked', garbage);
        } else {
          // 공격 받지 않는 플레이어
          io.to(rooms[socket.roomId]?.garbageBlockCnt[i]?.id).emit(
            'someone attacked',
            garbage,
            rooms[socket.roomId]?.garbageBlockCnt[idx]?.id
          );
        }
      }

      rooms[socket.roomId].garbageBlockCnt[idx].garbageCnt += garbage;
    });

    socket.on('attacked finish', () => {
      socket.broadcast.to(socket.roomId).emit('someone attacked finish', socket.id);
    });

    socket.on('game over', () => {
      // 누군가 게임 오버 시
      rooms[socket.roomId].garbageBlockCnt[
        rooms[socket.roomId].garbageBlockCnt.findIndex((player) => player.id === socket.id)
      ].live = false;

      rooms[socket.roomId].gameOverPlayer++;

      if (rooms[socket.roomId].gameOverPlayer === io.adapter.rooms.get(socket.roomId).size - 1) {
        io.to(socket.roomId).emit('every player game over'); // 게임 오버 메시지를 전체 전송(전체 전송은 io로)
        rooms[socket.roomId].gameOverPlayer = 0;
      }
    });

    socket.on('disconnect', () => {
      socket.broadcast.to(socket.roomId).emit('disconnect player', socket.id); // 게임 종료 시 다른 사람들한테 전달

      // if (rooms[online[socket.id].room].players != undefined)
      //   rooms[online[socket.id].room].players = rooms[online[socket.id].room].players.filter(
      //     (player) => player != socket.id
      //   );

      // if(rooms[online[socket.id].room].players.length == 0) { // 모두가 방을 비우면 해당 방 삭제
      //   delete rooms[online[socket.id].room];
      // }

      // delete online[socket.id]; // 일단 온라인에서 유저도 삭제
    });
  });
};
