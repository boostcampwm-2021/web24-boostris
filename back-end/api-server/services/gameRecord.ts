import { insertIntoTable } from '../database/query';

export const insertGameInfo = async (game) => {
  try {
    await insertIntoTable(
      `game_info`,
      `(game_id, game_date, game_mode)`,
      `'${game.game_id}', '${game.game_date}', '${game.game_mode}'`
    );
    return true;
  } catch (error) {
    return false;
  }
};

export const insertPlayerInfo = (game_id, players) => {
  try {
    players.map(async (obj) => {
      obj.player_win = obj.player_win === false ? 0 : 1;
      await insertIntoTable(
        `play`,
        `(oauth_id, game_id, play_time, ranking, attack_cnt, attacked_cnt, player_win)`,
        `'${obj.oauth_id}', '${game_id}', ${obj.play_time}, ${obj.ranking}, ${obj.attack_cnt}, ${obj.attacked_cnt}, ${obj.player_win}`
      );
    });
    return true;
  } catch (error) {
    return false;
  }
};
