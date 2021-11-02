import * as express from 'express';
import * as jwt from 'jsonwebtoken';
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const logger = require('morgan');
const axios = require('axios');

require('dotenv').config();
const bodyParser = require('body-parser');
import AuthRouter from '../routes/auth';
import selectTable from '../database/query';

class App {
  public application: express.Application;
  constructor() {
    this.application = express();
  }
}
const app = new App().application;
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

/* JWT */
const setJWT = (req, res) => {
  const jwtSignature = jwt.sign(
    { expiresIn: '10h' }, // 임의 값 넣어놓음
    process.env.JWT_SECRET_KEY
  );
  res.cookie('user', jwtSignature, {
    expires: new Date(Date.now() + 600000),
  });
};
/* JWT (end) */

/*
  이미 존재하는 회원인지 확인
*/
const isOauthIdInDB = (oauthID) => {
  return selectTable('*', 'USER_INFO', `oauth_id='${oauthID}'`);
};

/* naver */
const getUserInfoFromNaver = async (accessToken) => {
  const header = 'Bearer ' + accessToken;
  const apiUrl = 'https://openapi.naver.com/v1/nid/me';
  const headers = {
    Authorization: header,
  };
  try {
    const { data } = await axios.get(apiUrl, {
      headers: headers,
    });
    isOauthIdInDB(data);
    return data;
  } catch (err) {
    /*error 처리 */
  }
};

/* naver (end) */

app.get('/', (req: express.Request, res: express.Response) => {
  res.send('start');
});

app.post('/login', async (req: express.Request, res: express.Response) => {
  if (req.body['vendor'] === 'naver') {
    const accessToken = req.body['accessToken']; // 에러 처리 필요
    const userInfoFromNaver = await getUserInfoFromNaver(accessToken);
    console.log(userInfoFromNaver);
    /* 만약 네이버 로그인에 성공하면 jwt 토큰 발급 */
    if (isOauthIdInDB(userInfoFromNaver['response']['id'])) {
      setJWT(req, res);
    }
    res.json('hello');
  } else if (req.body['vendor'] === 'google') {
    console.log(req.body);
  }
});

app.use('/auth', AuthRouter);

app.listen(4000, () => console.log('start'));
