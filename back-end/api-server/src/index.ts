import * as express from 'express';
const bodyParser = require('body-parser');
const cors = require('cors');
import AuthRouter from '../routes/auth';

class App {
  public application: express.Application;
  constructor() {
    this.application = express();
  }
}
const app = new App().application;
app.use(bodyParser.json());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use('/auth', AuthRouter);

app.get('/', (req: express.Request, res: express.Response) => {
  res.send('start');
});

app.post('/login', (req: express.Request, res: express.Response) => {
  console.log('naver');
  console.log(req.body);
});

app.listen(4000, () => console.log('start'));
