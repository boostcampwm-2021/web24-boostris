import * as express from 'express';
import {
  getFriendList,
  requestFriend,
  requestFriendList,
  requestFriendUpdate,
} from '../services/friend';

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
  const result = await requestFriend({ requestee, requester });
  if (result) {
    res.status(200).json(setMessage({}, 'success'));
  } else {
    res.status(400).json(setMessage({}, 'fail'));
  }
});

// 친구 요청 수락, 거절 + 수락햇을때 실제 친구 데이터베이스에 넣기
FriendRouter.post('/request-update', async (req, res, next) => {
  const { isAccept, requestee, requester } = req.body;
  const result = await requestFriendUpdate({ isAccept, requestee, requester });
  if (result) {
    res.status(200).json(setMessage({}, 'success'));
  } else {
    res.status(400).json(setMessage({}, 'fail'));
  }
});

// 나한테 들어온 친구 요청 목록 가져오기
FriendRouter.post('/request-list', async (req, res, next) => {
  const { requestee } = req.body;
  const friendRequestList = await requestFriendList({ requestee });
  if (friendRequestList ?? 0) {
    res.status(200).json(setMessage(friendRequestList, 'success'));
  } else {
    res.status(400).json(setMessage({}, 'fail'));
  }
});

// 내 친구 목록 가져오기
FriendRouter.post('/list', async (req, res, next) => {
  const { id } = req.body;
  const friendList = await getFriendList({ id });
  if (friendList ?? 0) {
    res.status(200).json(setMessage(friendList, 'success'));
  } else {
    res.status(400).json(setMessage({}, 'fail'));
  }
});

export default FriendRouter;
