import * as express from 'express';
import { selectTable } from '../database/query';

const RankRouter = express.Router();

const categoryBox: any = {
  totalWin: 'player_win',
  attackCnt: 'attack_cnt',
};

// 무한 스크롤 구현을 염두해서, offset을 추가적으로 받습니다.
// offsetRank : 랭킹 몇 번째 까지 스크롤을 내렸는지 파악하기 위함.
interface Query {
  category?: any;
  mode?: String;
  nickName?: String;
  offsetRank?: any;
}

const rankResponse = {
  data: [],
  message: '',
};

RankRouter.get('/', async (req, res) => {
  try {
    const { category, mode, nickName, offsetRank }: Query = req.query;
    const queryResult = await selectTable(
      '*',
      `(SELECT 
      p.nickname, 
      sum(p.${categoryBox[category]}), 
      ANY_VALUE(u.state_message), 
      rank() over (order by ANY_VALUE(p.${categoryBox[category]}) desc) as ranking
      FROM
      PLAY as p 
      left join user_info as u on p.nickname = u.nickname 
      inner join game_info as g on p.game_id = g.game_id and g.\`mode\` = ${mode} 
      group by p.nickname) a`,
      `ranking >= ${Number(offsetRank)} and ranking < ${Number(offsetRank) + 20}`
    );
    rankResponse.data = queryResult;
    rankResponse.message = 'success';
    res.status(200).json(rankResponse);
  } catch (error) {
    rankResponse.message = 'error';
    res.status(400).json(rankResponse);
  }
});

export default RankRouter;
