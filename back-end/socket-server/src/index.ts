import { initSocket } from './../services/socket';
import * as express from 'express';
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const logger = require('morgan');
const http = require('http');

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

app.get('/socket/hello', (req: express.Request, res: express.Response) => {
  res.json('world');
});
app.get('/socket', (req: express.Request, res: express.Response) => {
  res.send('start');
});

const server = http.createServer(app);

initSocket(server);

server.listen(5001);
