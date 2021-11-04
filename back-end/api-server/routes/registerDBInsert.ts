import * as express from 'express';
import { insertIntoTable } from '../database/query';

const RegisterRouter = express.Router();

RegisterRouter.post('/insert', (req, res, next) => {
  //db insert 로직 필요
  const data = req.body.registerData;
  const nickName = data.nickname;
  const message = data.message;
  const authId = data.oauthInfo;
  if (
    insertIntoTable(
      'USER_INFO',
      '(nickname, state_message, oauth_id, total_game_number, total_win, total_play_time)',
      `'${nickName}', '${message}', '${authId}', 0, 0, '00:00:00'`
    )
  ) {
    // DB에 넣는 것이 실패한 경우
    res.json({ dupCheck: true, dbInsertError: true });
  } else {
    res.json({ dupCheck: true, dbInsertError: false });
  }
});

export default RegisterRouter;
//`INSERT INTO ${table} VALUES (${values})`;