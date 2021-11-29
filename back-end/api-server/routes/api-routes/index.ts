import * as express from 'express';
import AuthRouter from './auth';
import InsertDbRegister from './registerDBInsert';
import ProfileRouter from './profile';
import RankingRouter from './rankingSearch';
import FriendRouter from './friend';
import GameRecordRouter from './gameRecord';
import { registerDupCheck } from '../../middlewares/jwt';

const ApiRouter = express.Router();

ApiRouter.use('/auth', AuthRouter);
ApiRouter.use('/rank', RankingRouter);
ApiRouter.use('/register', registerDupCheck, InsertDbRegister);
ApiRouter.use('/profile', ProfileRouter);
ApiRouter.use('/friend', FriendRouter);
ApiRouter.use('/game/record', GameRecordRouter);

export default ApiRouter;
