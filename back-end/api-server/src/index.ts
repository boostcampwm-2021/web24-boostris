import * as express from 'express';
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const logger = require('morgan');
const axios = require('axios');
import 'dotenv/config';
import AuthRouter from '../routes/auth';

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
app.use('/auth', AuthRouter);

app.get('/', (req: express.Request, res: express.Response) => {
  res.send('start');
});

app.listen(4000, () => console.log('start'));
