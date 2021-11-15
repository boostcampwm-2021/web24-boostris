import { setJWT } from './../services/auth';
import { insertIntoTable, selectTable } from './../database/query';
import * as jwt from 'jsonwebtoken';

export function authenticateToken(req, res, next) {
  try {
    const token = req.cookies.user;
    if (token == null) return res.sendStatus(401);
    else if (token) {
      jwt.verify(token, process.env.JWT_SECRET_KEY as string, (err: any, user: any) => {
        if (err) return res.sendStatus(403);

        req.user = user;

        next();
      });
    }
  } catch (error) {
    return res.sendStatus(403);
  }
}

export async function registerDupCheck(req, res, next) {
  try {
    const nickName = req.body['registerData']['nickname'];
    const userDupCheckResult = await selectTable('*', 'USER_INFO', `nickname='${nickName}'`);
    if (userDupCheckResult?.length) {
      throw Error('already exists');
    } else {
      next();
    }
  } catch (error) {
    res.json({ dupCheck: false });
  }
}
