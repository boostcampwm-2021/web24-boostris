export const initTetrisSocket = (io) => {
  const online = {};
  const room = 0;
  const rooms = {
    0 : {
      players: []    
    },
  };

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
  
    socket.on('drop block', block => { // 내 떨어지는 블록을 다른 사람에게 전송한다.
      socket.broadcast.to(room).emit(`other player's drop block`, socket.id, block);
    })
  
    socket.on('disconnect', () => {
      console.log(`disconnect ${socket.id}`);
  
      if(rooms[online[socket.id].room].players != undefined)
        rooms[online[socket.id].room].players = rooms[online[socket.id].room].players.filter(player => player != socket.id);
      
      
      // if(rooms[online[socket.id].room].players.length == 0) { // 모두가 방을 비우면 해당 방 삭제
      //   delete rooms[online[socket.id].room];
      // }
      
      delete online[socket.id]; // 일단 온라인에서 유저도 삭제
      
      console.log(online);
      console.log(rooms);
    });
  
    socket.on('canvas', (data) => {
      console.log(data);
    });
  });  
}
