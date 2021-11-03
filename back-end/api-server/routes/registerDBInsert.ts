import * as express from 'express';
import { selectIntoTable } from '../database/query';
const RegisterRouter = express.Router();

RegisterRouter.post('/insert', (req, res, next) => {
  //db insert 로직 필요
  const nickName = req.body;
});

export default RegisterRouter;
