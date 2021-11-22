import * as express from 'express';
import { insertGameInfo, insertPlayerInfo } from '../services/gameRecord';

const GameRecordRouter = express.Router();

GameRecordRouter.post('/', async (req, res, next) => {
  const { game, players } = req.body;
  const insertGameInfoResult = await insertGameInfo(game);
  const insertPlayerInfoResult = await insertPlayerInfo(players);
  if (insertGameInfoResult && insertPlayerInfoResult) {
    res.status(200).json({ message: 'success' });
  } else {
    res.status(400).json({ message: 'fail' });
  }
});

export default GameRecordRouter;
