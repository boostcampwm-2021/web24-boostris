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
  lastNickName?: String; // 클라이언트에서 마지막으로 뜬 닉네임
}

const rankResponse = {
  data: [],
  categoryKey: '',
  message: '',
};

const profileResponse = {
  data: [],
  message: '',
};

RankRouter.post('/myInfo', async (req, res) => {
  try {
    const { nickname } = req.body.myInfoTemplate;
    let queryResult = await selectTable(
      `sum(player_win), sum(attack_cnt)`,
      `PLAY group by nickname having nickname = '${nickname}'`
    ); // 지금은 nickname이 아니라 oauth id이므로 추후 스토어에 추가되면 바꿀 예정.
    profileResponse.data = queryResult?.[0];
    profileResponse.message = 'success';
    res.status(200).json(profileResponse);
  } catch (error) {
    profileResponse.message = 'fail';
    res.status(400).json(profileResponse);
  }
});

RankRouter.post('/', async (req, res) => {
  try {
    const { category, mode, nickName, offsetRank, lastNickName }: Query = req.body.rankApiTemplate;
    let queryResult = await selectTable(
      '*',
      `(SELECT 
      p.nickname as nickname, 
      sum(p.${categoryBox[category]}) as category, 
      ANY_VALUE(u.state_message) as state_message, 
      rank() over (order by sum(p.${categoryBox[category]}) desc) as ranking
      FROM
      PLAY as p 
      left join user_info as u on p.nickname = u.nickname 
      inner join game_info as g on p.game_id = g.game_id and g.\`game_mode\` = '${mode}' 
      group by p.nickname) a`
      //`ranking >= ${Number(offsetRank)} and ranking < ${Number(offsetRank) + 20}`
      //바로 위 코드는 무한 스크롤 구현 시 고려해 볼 것
    );
    // 클라이언트로 부터 받은 닉네임이 있으면, 그 닉네임 부터의 배열을 보내면 됨
    if (nickName) {
      let nickNameIndex = queryResult.findIndex(function (item) {
        return item.nickname === nickName;
      });
      queryResult = nickNameIndex < 0 ? queryResult : queryResult.slice(nickNameIndex); // 정해지는 정책에 따라 다를 것으로 보임
    }
    rankResponse.data = queryResult;
    rankResponse.message = 'success';
    res.status(200).json(rankResponse);
  } catch (error) {
    rankResponse.message = 'error';
    res.status(400).json(rankResponse);
  }
});

export default RankRouter;
