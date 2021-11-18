export type googleUserInfoProps = {
  email: string;
  name: string;
  vendor: string;
};

export interface registerDataContent {
  nickname: string;
  message: string;
  oauthInfo: any;
}
export interface requestApiBody {
  requestee: string;
  requester: string;
  cb: Function;
}

export interface requestUpdateApiBody extends requestApiBody {
  isAccept: number;
}

export interface requestListApiBody {
  requestee: string;
}
export interface listApiBody {
  nickname: string;
}

export const makeFriendRequest = async (requestBody: requestApiBody) => {
  const { requestee, requester } = requestBody;
  return fetch('/api/friend/request', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ requestee, requester }),
  }).then((res) => res.json());
};

export const updateFriendRequest = async (requestBody: requestUpdateApiBody) => {
  const { isAccept, requestee, requester } = requestBody;
  return fetch('/api/friend/request-update', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ isAccept, requestee, requester }),
  }).then((res) => res.json());
};

export const requestList = async (requestBody: requestListApiBody) => {
  return fetch(`/api/friend/request-list?requestee=${requestBody.requestee}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  }).then((res) => res.json());
};

export const friendList = async (requestBody: listApiBody) => {
  return fetch(`/api/friend/list?nickname=${requestBody.nickname}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  }).then((res) => res.json());
};
