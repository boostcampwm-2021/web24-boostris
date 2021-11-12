import * as express from 'express';
import { selectTable } from '../database/query';
const RegisterRouter = express.Router();

RegisterRouter.post('/insert', async (req, res, next) => {});

export default RegisterRouter;
