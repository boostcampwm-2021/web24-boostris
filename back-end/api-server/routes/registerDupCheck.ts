import * as express from 'express';
import { selectIntoTable } from '../database/query';
const RegisterRouter = express.Router();

RegisterRouter.post('/insert', async (req, res, next) => {
  const nickName = req.body['registerData']['nickname'];
  const userDupCheckResult = await selectIntoTable(
    '*',
    'USER_INFO',
    `nickname='${nickName}'`
  );
  if (userDupCheckResult?.length) {
    res.json({ dupCheck: false });
  } else next();
});

export default RegisterRouter;
