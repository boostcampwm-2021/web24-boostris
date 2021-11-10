export const initTetrisSocket = (io) => {
  const online = {};
  const room = 0;
  const rooms = {
    0 : {
      players: []    
    },
  };
  let gameOverPlayer = 0;
  let garbageBlockCnt = [];

  io.on('connection', (socket) => {
    console.log(`socket ${socket.id} connect`);
  
    socket.join(room);
    online[socket.id] = {room: room};
    rooms[room].players.push(socket.id);
  
    console.log(online);
    console.log(rooms);
  // socket.on('join room', (roomId) => { // 방 ID 를 고유하게 만들어서 join할 예정
  //   online[socket.id] = {room: roomId};
  
  //   //socket.broadcast.to(roomId).emit('join new player', socket.id);
  //   //socket.emit('get other players info', rooms[roomId].players); // 누군가 방에 들어오면 자신을 제외한 모든 사람들 전송
  
  //   rooms[roomId].players.push(socket.id);
  
  //   //if(!rooms[roomId].players) return;
  //   console.log(online);
  //   console.log(rooms);
  // });
  
  socket.broadcast.to(room).emit('enter new player', socket.id);
  
  socket.on('get other players info', res => {
    const otherPlayer = rooms[room].players.filter(player => player != socket.id);
    res(otherPlayer);
  });

  socket.on('game start', () => { // 다른 누군가 게임 시작을 눌렀다면 다른 사용자들에게 알림
    io.to(room).emit('game started');
    
    garbageBlockCnt = [];
    rooms[room].players.forEach(player => garbageBlockCnt.push({id: player, garbageCnt: 0}));

    console.log('게임 시작');
  });

  socket.on('drop block', (board, block) => { // 내 떨어지는 블록을 다른 사람에게 전송한다.
    socket.broadcast.to(room).emit(`other player's drop block`, socket.id, board, block);
  })

  socket.on('attack other player', garbage => {
    garbageBlockCnt.sort((a, b) => a.garbageCnt - b.garbageCnt);

    let idx = 0;

    if(garbageBlockCnt[idx].id === socket.id) { // 블록 수가 가장 작은 사람이 자기 자신이라면 다음 사람에게
      idx++;
    }

    for(let i = 0; i < garbageBlockCnt.length; i++) {
      if(i === idx) { // 공격 받는 플레이어
        io.to(garbageBlockCnt[i].id).emit('attacked', garbage);
      }
      else { // 공격 받지 않는 플레이어
        io.to(garbageBlockCnt[i].id).emit('someone attacked', garbage, garbageBlockCnt[idx].id);
      }
    }
    
    garbageBlockCnt[idx].garbageCnt += garbage;
  });

  socket.on('attacked finish', () => {
    socket.broadcast.to(room).emit('someone attacked finish', socket.id);
  });

  socket.on('game over', () => { // 누군가 게임 오버 시
    gameOverPlayer++;

    if(gameOverPlayer === rooms[room].players.length - 1) {
      io.to(room).emit('every player game over'); // 게임 오버 메시지를 전체 전송(전체 전송은 io로)
      gameOverPlayer = 0;
    }
  }); 
  
  socket.on('disconnect', () => {
    console.log(`disconnect ${socket.id}`);

    socket.broadcast.to(room).emit('disconnect player', socket.id); // 게임 종료 시 다른 사람들한테 전달

    if(rooms[online[socket.id].room].players != undefined)
      rooms[online[socket.id].room].players = rooms[online[socket.id].room].players.filter(player => player != socket.id);
    
    
    // if(rooms[online[socket.id].room].players.length == 0) { // 모두가 방을 비우면 해당 방 삭제
    //   delete rooms[online[socket.id].room];
    // }
    
    delete online[socket.id]; // 일단 온라인에서 유저도 삭제
    
    console.log(online);
    console.log(rooms);
  });
  });  
}
