import { request } from 'express';
import { deleteTable, insertIntoTable, selectTable } from '../database/query';

export const requestFriend = async ({ requestee, requester }) => {
  try {
    await insertIntoTable(
      'FRIEND_REQUEST',
      `(friend_requestee, friend_requester)`,
      `'${requestee}', '${requester}'`
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
      `friend_requestee='${requestee}' and friend_requester='${requester}'`
    );
    if (isAccept) {
      await insertIntoTable(`FRIENDSHIP`, `(friend1, friend2)`, `'${requestee}', '${requester}'`);
      await insertIntoTable(`FRIENDSHIP`, `(friend1, friend2)`, `'${requester}', '${requestee}'`);
    }
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const requestFriendList = async ({ requestee }) => {
  try {
    const result = await selectTable(
      `friend_requester`,
      `FRIEND_REQUEST`,
      `friend_requestee='${requestee}'`
    );
    const returnData = [];
    result.map((value) => returnData.push(value.friend_requester));
    return returnData;
  } catch (error) {
    return undefined;
  }
};

export const getFriendList = async ({ id }) => {
  try {
    const result = await selectTable(`friend2`, `FRIENDSHIP`, `friend1='${id}'`);
    const returnData = [];
    result.map((value) => returnData.push(value.friend2));
    return returnData;
  } catch (error) {
    return undefined;
  }
};
