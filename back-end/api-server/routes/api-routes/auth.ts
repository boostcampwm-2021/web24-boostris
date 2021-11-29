import * as express from 'express';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';
import { selectTable } from '../../database/query';
import 'dotenv/config';

import { getGithubUser, getUserInfoFromNaver, setJWT } from '../../services/auth';

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
      console.log(userList);
      const [user] = userList;
      setJWT(req, res, user);
      return [true, user];
    } else {
      /* 회원 가입 페이지로 redirect */
      console.log('fail');
      return [false];
    }
  } catch (e) {
    console.log(e);
    return [false];
  }
};

AuthRouter.post('/github/code', async (req, res) => {
  const { code } = req.body;

  try {
    if (code) {
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
        timeout: 3000,
        timeoutErrorMessage: 'time out',
      });
      const { access_token } = data;
      if (access_token) {
        const user = await getGithubUser(access_token);
        if (!user) {
          throw Error('github error');
        }
        const [isOurUser, target] = await oauthDupCheck(user['id'], req, res); // 일단 중복 안되는 login 으로 해놓음
        const id = user.id;
        res.status(200).json({ id, isOurUser, nickname: target?.nickname });
      } else {
        throw Error('github error');
      }
    } else {
      res.status(400).json({
        success: false,
      });
    }
  } catch (error) {
    console.error(error);
    res.sendStatus(400);
  }
});

AuthRouter.post('/naver/token', async (req, res) => {
  const { accessToken } = req.body;
  try {
    const userInfoFromNaver = await getUserInfoFromNaver(accessToken);
    const id = userInfoFromNaver['response']['id'];

    if (id) {
      const [isOurUser, target] = await oauthDupCheck(id, req, res);
      res.json({ id, isOurUser, nickname: target?.nickname });
    } else {
      throw Error('naver error');
    }
  } catch (error) {
    console.error(error);
    res.sendStatus(400);
  }
});

AuthRouter.post('/google/user', async (req, res) => {
  const { email, name } = req.body;
  try {
    const [isOurUser, target] = await oauthDupCheck(email, req, res);
    res.json({ id: email, isOurUser, nickname: target?.nickname });
  } catch (error) {
    console.error(error);
    res.sendStatus(400);
  }
});

AuthRouter.get('/jwt', async (req, res) => {
  try {
    if (req.cookies.user) {
      const { nickname, oauth_id } = jwt.verify(
        req.cookies.user,
        process.env.JWT_SECRET_KEY
      ) as any;
      res.json({ authenticated: true, nickname, oauth_id });
    } else {
      throw new Error('no-cookie');
    }
  } catch (error) {
    res.json({ authenticated: false });
  }
});

AuthRouter.get('/logout', async (req, res) => {
  res.clearCookie('user');
  res.json({ authenticated: false });
});

export default AuthRouter;
