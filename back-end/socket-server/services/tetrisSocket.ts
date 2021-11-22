import { Namespace } from 'socket.io';
import axios from 'axios';
import { userSocket } from '../type/socketType';
import { roomList } from '../constant/room';

export const initTetrisSocket = (mainSpace: Namespace, socket: userSocket) => {
  socket.on('get other players info', (roomID, res) => {
    const target = roomList.find((r) => r.id === roomID);

    if (target) {
      const otherPlayer = target.player.filter((p) => p.id !== socket.id);
      res(otherPlayer);
    }
  });

  socket.on('game start', (roomID) => {
    // 다른 누군가 게임 시작을 눌렀다면 다른 사용자들에게 알림
    const target = roomList.find((r) => r.id === roomID);

    if (target) {
      target.gameStart = true;
      target.semaphore = 0;
      target.gameOverPlayer = 0;

      mainSpace.to(roomID).emit('game started');

      target.gamingPlayer = [];
      [...mainSpace.adapter.rooms.get(roomID)].forEach((player) => {
        target.gamingPlayer.push({ id: player });
      });

      target.garbageBlockCnt = [];
      [...mainSpace.adapter.rooms.get(roomID)].forEach((player) => {
        target.garbageBlockCnt.push({ id: player, garbageCnt: 0 });
      });
      target.rank = [];
    }
  });

  socket.on('drop block', (board, block) => {
    // 내 떨어지는 블록을 다른 사람에게 전송한다.
    socket.broadcast.to(socket.roomID).emit(`other player's drop block`, socket.id, board, block);
  });

  socket.on('attack other player', (garbage) => {
    const target = roomList.find((r) => r.id === socket.roomID);

    if (target && target.garbageBlockCnt.length !== 1) {
      // 한 명 남은 경우 예외 처리
      target.garbageBlockCnt.sort((a, b) => a.garbageCnt - b.garbageCnt);

      let idx = 0;

      if (target.garbageBlockCnt[idx].id === socket.id) {
        // 블록 수가 가장 작은 사람이 자기 자신이라면 다음 사람에게
        idx++;
      }

      mainSpace.to(target.garbageBlockCnt[idx].id).emit('attacked', garbage);

      // 누가 공격 받았는지 전파
      [...mainSpace.adapter.rooms.get(socket.roomID)].forEach((player) => {
        if (player === target.garbageBlockCnt[idx].id) return;
        mainSpace.to(player).emit('someone attacked', garbage, target.garbageBlockCnt[idx].id);
      });

      target.garbageBlockCnt[idx].garbageCnt += garbage;
    }
  });

  socket.on('attacked finish', () => {
    socket.broadcast.to(socket.roomID).emit('someone attacked finish', socket.id);
  });

  socket.on('game over', () => {
    // 누군가 게임 오버 시
    const target = roomList.find((r) => r.id === socket.roomID);

    if (target) {
      target.garbageBlockCnt = target.garbageBlockCnt.filter((player) => player.id !== socket.id);
      target.rank.push({
        id: socket.id,
        oauthID: '',
        nickname: socket.userName,
        playTime: 0,
        ranking: target.gamingPlayer.length - target.gameOverPlayer,
        attackCnt: 0,
        attackedCnt: 0,
      });
      target.gameOverPlayer++;

      if (
        target.gamingPlayer.length === 1 ||
        target.gameOverPlayer === target.gamingPlayer.length - 1
      ) {
        target.gameStart = false;
        mainSpace.to(socket.roomID).emit('every player game over');

        if (target.gamingPlayer.length !== 1) {
          target.gamingPlayer.forEach((p) => {
            mainSpace.to(p.id).emit('game over info');
          });
        }
      }
    }
  });

  socket.on('get game over info', (oauthID, playTime, attackCnt, attackedCnt) => {
    const target = roomList.find((r) => r.id === socket.roomID);

    if (target) {
      const rankTarget = target.rank.find((r) => r.nickname === socket.userName);

      target.semaphore++;

      if (!rankTarget) {
        target.rank.push({
          id: socket.id,
          oauthID,
          nickname: socket.userName,
          playTime,
          ranking: 1,
          attackCnt,
          attackedCnt,
        });
      } else {
        rankTarget.oauthID = oauthID;
        rankTarget.playTime = playTime;
        rankTarget.attackCnt = attackCnt;
        rankTarget.attackedCnt = attackedCnt;
      }

      if (target.semaphore === target.gamingPlayer.length) {
        target.semaphore = 0;
        target.gameOverPlayer = 0;

        target.rank.sort((a, b) => a.ranking - b.ranking);

        mainSpace.to(socket.roomID).emit('send rank table', target.rank);

        const date = new Date();
        const game_id = `${socket.roomID}${date.getTime()}`;
        const data = {
          game: {
            game_id: game_id,
            game_date: getTimeStamp(date),
            game_mode: 'normal',
          },
          players: [],
        };

        target.rank.forEach((r, idx) => {
          data.players.push({
            oauth_id: r.oauthID,
            play_time: r.playTime,
            ranking: r.ranking,
            attack_cnt: r.attackCnt,
            attacked_cnt: r.attackedCnt,
            player_win: idx === 0 ? true : false,
          });
        });

        axios({
          method: 'post',
          url: 'http://localhost:4000/api/game/record',
          data: data,
        });
      }
    }
  });
};

// 현재 시간을 구하는 함수 yyyy-mm-dd hh:mm:ss 형태로 (DB의 datetime형태랑 동일)
const getTimeStamp = (date) => {
  let d = new Date(date);
  let s =
    leadingZeros(d.getFullYear(), 4) +
    '-' +
    leadingZeros(d.getMonth() + 1, 2) +
    '-' +
    leadingZeros(d.getDate(), 2) +
    ' ' +
    leadingZeros(d.getHours(), 2) +
    ':' +
    leadingZeros(d.getMinutes(), 2) +
    ':' +
    leadingZeros(d.getSeconds(), 2);

  return s;
};

// 0 붙이기
const leadingZeros = (n, digits) => {
  let zero = '';
  n = n.toString();

  if (n.length < digits) {
    for (let i = 0; i < digits - n.length; i++) zero += '0';
  }

  return zero + n;
};
