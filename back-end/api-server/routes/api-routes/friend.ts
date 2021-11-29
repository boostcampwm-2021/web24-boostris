import * as express from 'express';
import {
  checkAlreadyFriend,
  getFriendList,
  requestFriend,
  requestFriendList,
  requestFriendUpdate,
} from '../../services/friend';

const FriendRouter = express.Router();
interface friendReturnFormInterface {
  data: Object;
  message: String;
}
const friendReturnForm: friendReturnFormInterface = {
  data: {},
  message: '',
};

const setMessage = (data, message) => {
  friendReturnForm.data = data;
  friendReturnForm.message = message;
  return friendReturnForm;
};

// 친구 요청 받을 시, 친구 요청 테이블에 넣기
FriendRouter.post('/request', async (req, res, next) => {
  const { requestee, requester } = req.body; // userId : 친구 요청을 보낸 사람, friendId : 친구 요청을 받은 사람
  try {
    const result = await requestFriend({ requestee, requester });
    const checkFriend = await checkAlreadyFriend({ requestee, requester }); // 이미 친구인지 확인
    if (result && !checkFriend) {
      res.status(200).json(setMessage({}, 'success'));
    } else {
      throw Error('request make error');
    }
  } catch (error) {
    console.error(error);
    res.status(400).json(setMessage({}, 'fail'));
  }
});

// 친구 요청 수락, 거절 + 수락햇을때 실제 친구 데이터베이스에 넣기
FriendRouter.post('/request-update', async (req, res, next) => {
  const { isAccept, requestee, requester } = req.body;
  try {
    const result = await requestFriendUpdate({ isAccept, requestee, requester });
    if (result) {
      res.status(200).json(setMessage({}, 'success'));
    } else {
      throw Error('request update error');
    }
  } catch (error) {
    console.error(error);
    res.status(400).json(setMessage({}, 'fail'));
  }
});

// 나한테 들어온 친구 요청 목록 가져오기
FriendRouter.get('/request-list', async (req, res, next) => {
  const requestee = req.query.requestee;
  try {
    const friendRequestList = await requestFriendList(requestee);
    if (friendRequestList ?? 0) {
      res.status(200).json(setMessage(friendRequestList, 'success'));
    } else {
      throw Error('request list error');
    }
  } catch (error) {
    console.error(error);
    res.status(400).json(setMessage([], 'fail'));
  }
});

// 내 친구 목록 가져오기
FriendRouter.get('/list', async (req, res, next) => {
  const oauthId = req.query.oauthId;
  try {
    const friendList = await getFriendList(oauthId);
    if (friendList ?? 0) {
      res.status(200).json(setMessage(friendList, 'success'));
    } else {
      throw Error('friendlist error');
    }
  } catch (error) {
    console.error(error);
    res.status(400).json(setMessage([], 'fail'));
  }
});

export default FriendRouter;
