import * as express from 'express';
import { selectTable, innerJoinTable, updateTable } from '../database/query';

const ProfileRouter = express.Router();

ProfileRouter.post('/', async (req, res, next) => {
  const stateMessageList = await getStateMessageInDB(req.body.nickname);
  const totalList = await getTotalInDB(req.body.nickname);
  const recentList = await getRecentInDB(req.body.nickname);

  if (stateMessageList.length === 0) {
    //잘못된 경우 에러처리
    res.status(401).json({ error: '잘못된 인증입니다.' });
  } else {
    const { state_message } = stateMessageList[0];
    const [total, win] = totalList;
    res.status(200).json({ state_message, total, win, recentList });
  }
});

ProfileRouter.patch('/', async (req, res, next) => {
  const result = await updateStateMessageInDB(req.body);
  if (result.warningStatus !== 0) {
    //잘못된 경우 에러처리
    console.log(result);
    res.status(401).json({ error: '잘못된 인증입니다.' });
  } else {
    res.status(200).json({ message: 'done' });
  }
});

const updateStateMessageInDB = ({ nickname, stateMessage }) => {
  return updateTable('USER_INFO', `state_message='${stateMessage}'`, `nickname='${nickname}'`);
};

const getStateMessageInDB = (nickname) => {
  return selectTable('state_message', 'USER_INFO', `nickname='${nickname}'`);
};

const getTotalInDB = async (nickname) => {
  return await Promise.all([
    selectTable(
      'SUM(attack_cnt) as total_attack_cnt, COUNT(nickname) as total_game_cnt, SEC_TO_TIME(SUM(TIME_TO_SEC(play_time))) as total_play_time ',
      'PLAY',
      `nickname='${nickname}'`
    ),
    innerJoinTable(
      'SUM(case when mode=2 then player_win else 0 end) as single_player_win, SUM(case when mode>2 then player_win else 0 end) as multi_player_win',
      'PLAY',
      'GAME_INFO',
      'PLAY.game_id = GAME_INFO.game_id',
      `nickname='${nickname}'`
    ),
  ]);
};

const getRecentInDB = (nickname) => {
  return innerJoinTable(
    'date, mode, ranking, play_time, attack_cnt, attacked_cnt',
    'PLAY',
    'GAME_INFO',
    'PLAY.game_id = GAME_INFO.game_id',
    `nickname='${nickname}'`
  );
};

export default ProfileRouter;