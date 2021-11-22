import { insertIntoTable } from '../database/query';

export const insertGameInfo = (game) => {
  try {
    const result = insertIntoTable(
      `game_info`,
      `(game_id, game_date, game_mode)`,
      `${game.game_id}, ${game.game_date}, ${game.game_mode}`
    );
    return true;
  } catch (error) {
    return false;
  }
};

export const insertPlayerInfo = (players) => {
  try {
    players.map((obj) => {
      insertIntoTable(
        `play`,
        `(oauth_id, play_time, play_time, ranking, attack_cnt, attacked_cnt, player_win)`,
        `${obj.oauth_id}, ${obj.play_time}, ${obj.ranking}, ${obj.attack_cnt}, ${obj.attacked_cnt}, ${obj.player_win}`
      );
    });
    return true;
  } catch (error) {
    return false;
  }
};
