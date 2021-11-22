import { request } from 'express';
import { deleteTable, insertIntoTable, selectTable } from '../database/query';

export const requestFriend = async ({ requestee, requester }) => {
  try {
    await insertIntoTable(
      'FRIEND_REQUEST',
      `(friend_requestee, friend_requester)`,
      `(select oauth_id from USER_INFO where nickname='${requestee}'), (select oauth_id from USER_INFO where nickname='${requester}')`
    );
    return true;
  } catch (error) {
    return false;
  }
};

export const requestFriendUpdate = async ({ isAccept, requestee, requester }) => {
  try {
    // delete 한 후에 insert 부분에서 에러가 난 경우를 생각해서 추후에 개선 필요
    await deleteTable(
      'FRIEND_REQUEST',
      `friend_requestee=(select oauth_id from USER_INFO where nickname='${requestee}') and friend_requester=(select oauth_id from USER_INFO where nickname='${requester}')`
    );
    if (isAccept) {
      await insertIntoTable(
        `FRIENDSHIP`,
        `(friend1, friend2)`,
        `(select oauth_id from USER_INFO where nickname='${requestee}'), (select oauth_id from USER_INFO where nickname='${requester}')`
      );
      await insertIntoTable(
        `FRIENDSHIP`,
        `(friend1, friend2)`,
        `(select oauth_id from USER_INFO where nickname='${requester}'), (select oauth_id from USER_INFO where nickname='${requestee}')`
      );
    }
    return true;
  } catch (error) {
    return false;
  }
};

export const requestFriendList = async (requestee) => {
  try {
    const result = await selectTable(
      `u.nickname, r.created_at`,
      `FRIEND_REQUEST r left outer join USER_INFO u ON r.friend_requester = u.oauth_id`,
      `r.friend_requestee = (select oauth_id from USER_INFO where nickname = '${requestee}')`
    );
    const returnData = [];
    result.map((value) =>
      returnData.push({ nickname: value.nickname, created_at: value.created_at })
    );
    return returnData;
  } catch (error) {
    return undefined;
  }
};

export const getFriendList = async (nickname) => {
  try {
    const result = await selectTable(
      `nickname`,
      `USER_INFO`,
      `oauth_id in (select friend2 from FRIENDSHIP where friend1=(select oauth_id from USER_INFO where nickname='${nickname}'))`
    );
    const returnData = [];
    result.map((value) => returnData.push(value.nickname));
    return returnData;
  } catch (error) {
    return undefined;
  }
};

export const checkAlreadyFriend = async ({ requestee, requester }) => {
  try {
    if (requestee === requester) return false; // 나 자신과 친구를 맺을 수 없으므로
    const result = await selectTable(
      `friend1`,
      `FRIENDSHIP`,
      `friend1=(select oauth_id from USER_INFO where nickname='${requestee}') and friend2=(select oauth_id from USER_INFO where nickname='${requester}')`
    );
    if (result && result.length > 0) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};
