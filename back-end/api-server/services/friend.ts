import { request } from 'express';
import { deleteTable, insertIntoTable, selectTable } from '../database/query';

export const requestFriend = async ({ requestee, requester }) => {
  try {
    await insertIntoTable(
      'FRIEND_REQUEST',
      `(friend_requestee, friend_requester)`,
      `(select oauth_id from user_info where nickname='${requestee}'), (select oauth_id from user_info where nickname='${requester}')`
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
      `friend_requestee=(select oauth_id from user_info where nickname='${requestee}') and friend_requester=(select oauth_id from user_info where nickname='${requester}')`
    );
    if (isAccept) {
      await insertIntoTable(
        `FRIENDSHIP`,
        `(friend1, friend2)`,
        `(select oauth_id from user_info where nickname='${requestee}'), (select oauth_id from user_info where nickname='${requester}')`
      );
      await insertIntoTable(
        `FRIENDSHIP`,
        `(friend1, friend2)`,
        `(select oauth_id from user_info where nickname='${requester}'), (select oauth_id from user_info where nickname='${requestee}')`
      );
    }
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const requestFriendList = async (requestee) => {
  try {
    const result = await selectTable(
      `nickname`,
      `user_info`,
      `oauth_id in (select friend_requester from friend_request where friend_requestee=(select oauth_id from user_info where nickname='${requestee}'));`
    );
    const returnData = [];
    result.map((value) => returnData.push(value.nickname));
    return returnData;
  } catch (error) {
    return undefined;
  }
};

export const getFriendList = async (nickname) => {
  try {
    const result = await selectTable(
      `nickname`,
      `user_info`,
      `oauth_id in (select friend2 from friendship where friend1=(select oauth_id from user_info where nickname='${nickname}'))`
    );
    const returnData = [];
    result.map((value) => returnData.push(value.nickname));
    return returnData;
  } catch (error) {
    return undefined;
  }
};
