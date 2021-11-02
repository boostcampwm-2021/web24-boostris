import * as express from 'express';
import axios from 'axios';
import 'dotenv/config';

import { getGithubUser } from '../services/auth';

const AuthRouter = express.Router();

AuthRouter.post('/github/code', async (req, res) => {
  const { code } = req.body;

  try {
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
    });

    const { access_token } = data;
    const user = await getGithubUser(access_token);

    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.sendStatus(400);
  }
});

export default AuthRouter;
