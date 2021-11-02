import * as express from 'express';
import axios from 'axios';
import 'dotenv/config';
import selectTable from '../database/query';

import { getGithubUser, getUserInfoFromNaver, setJWT } from '../services/auth';

const AuthRouter = express.Router();

/*
  이미 존재하는 회원인지 확인
*/
const isOauthIdInDB = (oauthID) => {
  return selectTable('*', 'USER_INFO', `oauth_id='${oauthID}'`);
};

const oauthDupCheck = async (id, req, res) => {
  try {
    const userList = await isOauthIdInDB(id);
    /* 만약 oauth 로그인에 성공하면 jwt 토큰 발급 */
    if (userList && userList.length) {
      setJWT(req, res);
      return true;
    } else {
      /* 회원 가입 페이지로 redirect */
      console.log('fail');
      return false;
    }
  } catch (e) {
    console.log(e);
  }
};

AuthRouter.post('/github/code', async (req, res) => {
  const { code } = req.body;

  try {
    const { data } = await axios({
      method: 'POST',
      url: 'https://github.com/login/oauth/access_token',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
      data: {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
    });

    const { access_token } = data;
    const user = await getGithubUser(access_token);
    const isOurUser = await oauthDupCheck(user['login'], req, res); // 일단 중복 안되는 login 으로 해놓음
    res.status(200).json({ user, isOurUser });
  } catch (error) {
    console.error(error);
    res.sendStatus(400);
  }
});

AuthRouter.post('/naver/token', async (req, res) => {
  const { accessToken } = req.body;
  const userInfoFromNaver = await getUserInfoFromNaver(accessToken);
  const email = userInfoFromNaver['response']['email'];
  const name = userInfoFromNaver['response']['name'];
  const id = userInfoFromNaver['response']['id'];

  const isOurUser = await oauthDupCheck(id, req, res);
  res.json({ email, name, isOurUser });
});

AuthRouter.post('/google/user', async (req, res) => {
  const { email, name } = req.body;
  const isOurUser = await oauthDupCheck(email, req, res);
  res.json({ email, name, isOurUser });
});

export default AuthRouter;
