import { initSocket } from './../services/socket';
import * as express from 'express';
import 'dotenv/config';

const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const logger = require('morgan');
const http = require('http');

const port = process.env.PORT || 5001;
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

const server = http.createServer(app);

initSocket(server, port);

server.listen(port);
