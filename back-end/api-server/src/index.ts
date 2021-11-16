import * as express from 'express';
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const logger = require('morgan');
const axios = require('axios');

import 'dotenv/config';
import AuthRouter from '../routes/auth';
import InsertDbRegister from '../routes/registerDBInsert';
import ProfileRouter from '../routes/profile';
import RankingRouter from '../routes/rankingSearch';
import FriendRouter from '../routes/friend';
import GameRecordRouter from '../routes/gameRecord';
import RankRouter from '../routes/rankSearch';
import * as swaggerUi from 'swagger-ui-express';
import * as YAML from 'yamljs';

import { registerDupCheck } from '../middlewares/jwt';

class App {
  public application: express.Application;
  constructor() {
    this.application = express();
  }
}
const app = new App().application;
const swaggerSpec = YAML.load(path.join(__dirname, '../build/swagger.yaml'));

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
app.use('/api/auth', AuthRouter);
app.use('/api/rank', RankingRouter);
app.use('/api/register', registerDupCheck, InsertDbRegister);
app.use('/api/profile', ProfileRouter);
<<<<<<< HEAD
app.use('/api/friend', FriendRouter);
app.use('/api/game/record', GameRecordRouter);
=======
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
>>>>>>> 82c3c03 (✨ : swagger 초기 세팅,  API 명세 작업 진행중)

app.get('/api', (req: express.Request, res: express.Response) => {
  res.send('start');
});

app.listen(4000, () => console.log('start'));
