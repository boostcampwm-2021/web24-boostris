import { pubClient } from './../services/socket';
import axios from 'axios';

import { getTimeStamp } from '../utils/dateUtil';

export const initGameInfo = (mainSpace, socket, target) => {
  [
    target.gameStart,
    target.semaphore,
    target.gameOverPlayer,
    target.rank,
    target.gamingPlayer,
    target.garbageBlockCnt,
  ] = [true, 0, 0, [], [], []];

  target.player.forEach((p) => {
    target.gamingPlayer.push({ id: p.id });
    target.garbageBlockCnt.push({ id: p.id, garbageCnt: 0 });
  });

  pubClient.set(`room:${target.id}`, JSON.stringify(target));

  mainSpace.to(socket.roomID).emit('game started');
};

export const playerAttackProcess = (mainSpace, socket, target, garbage) => {
  let idx = setAttackPlayer(target, socket.id);
  mainSpace.to(target.garbageBlockCnt[idx].id).emit('attacked', garbage);

  target.gamingPlayer.forEach((p) => {
    if (p === target.garbageBlockCnt[idx].id) return;
    mainSpace.to(p).emit('someone attacked', garbage, target.garbageBlockCnt[idx].id);
  });

  target.garbageBlockCnt[idx].garbageCnt += garbage;
  pubClient.set(`room:${target.id}`, JSON.stringify(target));
};

const setAttackPlayer = (target, id) => {
  target.garbageBlockCnt.sort((a, b) => a.garbageCnt - b.garbageCnt);

  let idx = 0;

  if (target.garbageBlockCnt[idx].id === id) {
    idx++;
  }

  pubClient.set(`room:${target.id}`, JSON.stringify(target));
  return idx;
};

export const gameOverProcess = (mainSpace, socket, target) => {
  target.garbageBlockCnt = target.garbageBlockCnt.filter((p) => p.id !== socket.id);
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

  pubClient.set(`room:${target.id}`, JSON.stringify(target));
  everyPlayerGameOverCheck(mainSpace, socket, target);
};

const everyPlayerGameOverCheck = (mainSpace, socket, target) => {
  if (
    target.gamingPlayer.length === 1 ||
    target.gameOverPlayer === target.gamingPlayer.length - 1
  ) {
    pubClient.set(`room:${target.id}`, JSON.stringify(target));
    mainSpace.to(socket.roomID).emit('every player game over');

    if (target.gamingPlayer.length !== 1) {
      pubClient.set(`room:${target.id}`, JSON.stringify(target));
      target.gamingPlayer.forEach((p) => {
        mainSpace.to(p.id).emit('game over info');
      });
    }
  }

  pubClient.set(`room:${target.id}`, JSON.stringify(target));
};

export const calcPlayerRank = (mainSpace, socket, target, data) => {
  const rankTarget = target.rank.find((r) => r.nickname === socket.userName);

  target.semaphore++;
  pubClient.set(`room:${target.id}`, JSON.stringify(target));

  if (!rankTarget) {
    target.rank.push({
      id: socket.id,
      oauthID: data.oauthID,
      nickname: socket.userName,
      playTime: data.playTime,
      ranking: 1,
      attackCnt: data.attackCnt,
      attackedCnt: data.attackedCnt,
    });
    pubClient.set(`room:${target.id}`, JSON.stringify(target));
  } else {
    [rankTarget.oauthID, rankTarget.playTime, rankTarget.attackCnt, rankTarget.attackedCnt] = [
      data.oauthID,
      data.playTime,
      data.attackCnt,
      data.attackedCnt,
    ];
    pubClient.set(`room:${target.id}`, JSON.stringify(target));
  }

  pubClient.set(`room:${target.id}`, JSON.stringify(target));
  // console.log(target);

  if (target.gameStart && target.semaphore === target.gamingPlayer.length) {
    [target.gameStart, target.semaphore, target.gameOverPlayer] = [false, 0, 0];

    target.rank.sort((a, b) => a.ranking - b.ranking);
    mainSpace.to(socket.roomID).emit('send rank table', target.rank);

    pubClient.set(`room:${target.id}`, JSON.stringify(target));
    sendData(makeData(socket, target));
  }
};

const makeData = (socket, target) => {
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

  pubClient.set(`room:${target.id}`, JSON.stringify(target));
  return data;
};

const sendData = (data) => {
  axios({
    method: 'post',
    url: `${process.env.API_HOST}/api/game/record`,
    data: data,
  });
};
